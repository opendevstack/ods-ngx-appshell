import { apply, applyTemplates, chain, externalSchematic, MergeStrategy, mergeWith, move,
  Rule, SchematicContext, Tree, url } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import * as ts from 'typescript';

export function azureLoginGenerator(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info('Integrating Azure login into the project');
    
    return chain([
      externalSchematic('@schematics/angular', 'service', {
        name: 'azure', 
        path: `src/app/services`
      }),
      mergeTemplate('azure-service', '/src/app/services'),
      
      externalSchematic('@schematics/angular', 'service', {
        name: 'app-config', 
        path: `src/app/services`
      }),
      mergeTemplate('app-config-service', '/src/app/services'),
      mergeTemplate('azure-config', '/src/app'),
      mergeTemplate('app-config', '/public/config'),
      
      addAzureServiceToAppComponent(),
      addTestsToAppComponent(),
      addAzureConfigToAppConfig()
    ]);
  };
}

function mergeTemplate(templateFolder: string, targetPath: string): Rule {
  return mergeWith(
    apply(url(`./files/${templateFolder}`), [
      applyTemplates({}),
      move(normalize(targetPath))
    ]),
    MergeStrategy.Overwrite
  );
}

function addAzureServiceToAppComponent(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const appComponentPath = 'src/app/app.component.ts';
    let sourceText = readFileContent(tree, appComponentPath, context);
    if (!sourceText) return tree;
    
    const sourceFile = ts.createSourceFile(appComponentPath, sourceText, ts.ScriptTarget.Latest, true);
    
    sourceText = ensureImport(sourceText, sourceFile, 'AzureService', './services/azure.service');
    sourceText = ensureImport(sourceText, sourceFile, 'OnInit', '@angular/core', 'Component');

    if (hasConstructor(sourceFile)) {
      if (!sourceText.includes('AzureService')) {
        sourceText = updateConstructor(sourceText);
        context.logger.info('Updated constructor with AzureService injection');
      }
    } else {
      sourceText = addConstructor(sourceText);
      context.logger.info('Added constructor with AzureService injection');
    }

    sourceText = ensureMethodWithContent(sourceText, sourceFile, 'ngOnInit', 
      `this.azureService.initialize();\n    this.azureService.loggedUser$.subscribe((user) => {\n      this.loggedUser = user;\n    });`,
      context
    );
    
    if (!sourceText.includes('implements OnInit')) {
      sourceText = addOnInitInterface(sourceText);
    }

    sourceText = ensureMethodWithContent(sourceText, sourceFile, 'login', 'this.azureService.login();', context);
    sourceText = ensureMethodWithContent(sourceText, sourceFile, 'logout', 'this.azureService.logout();', context);

    if (!sourceText.includes('loggedUser')) {
      sourceText = addProperty(sourceText, 'loggedUser: any;');
      context.logger.info('Added loggedUser property');
    }

    tree.overwrite(appComponentPath, sourceText);
    context.logger.info(`Updated ${appComponentPath} successfully`);
    
    return tree;
  };
}

function addTestsToAppComponent(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const appComponentSpecPath = 'src/app/app.component.spec.ts';
    let sourceText = readFileContent(tree, appComponentSpecPath, context);
    if (!sourceText) return tree;
    
    const sourceFile = ts.createSourceFile(appComponentSpecPath, sourceText, ts.ScriptTarget.Latest, true);

    sourceText = ensureImport(sourceText, sourceFile, 'AzureService', './services/azure.service');
    sourceText = ensureImport(sourceText, sourceFile, 'of', 'rxjs');
    sourceText = ensureImport(sourceText, sourceFile, 'provideHttpClient', '@angular/common/http');
    sourceText = ensureImport(sourceText, sourceFile, 'BrowserAnimationsModule', '@angular/platform-browser/animations');
    
    if (sourceText.includes('import { TestBed }') && !sourceText.includes('ComponentFixture')) {
      sourceText = sourceText.replace('import { TestBed', 'import { TestBed, ComponentFixture');
    }

    const newBeforeEach = `let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAzureService: jasmine.SpyObj<AzureService>;

  beforeEach(async () => {
    mockAzureService = jasmine.createSpyObj('AzureService', ['initialize', 'login', 'logout'], { loggedUser$: of(null) });

    await TestBed.configureTestingModule({
      imports: [AppComponent, BrowserAnimationsModule],
      providers: [
        { provide: AzureService, useValue: mockAzureService },
        provideHttpClient()
      ]
    }).compileComponents();
  });
  
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });`;

    if (!sourceText.includes('mockAzureService')) {
      const beforeEachRegex = /beforeEach\(async\s*\(\)\s*=>\s*{[\s\S]*?TestBed\.configureTestingModule\({[\s\S]*?}\)\.compileComponents\(\);[\s\S]*?}\);/;
      sourceText = sourceText.replace(beforeEachRegex, newBeforeEach);
      context.logger.info('Updated beforeEach block in test file');
    }

    if (!sourceText.includes('should call login method')) {
      const newTests = `
  it('should initialize the service and subscribe to loggedUser$ on ngOnInit', () => {
    component.ngOnInit();
    expect(mockAzureService.initialize).toHaveBeenCalled();
    expect(component.loggedUser).toBeNull();
  });

  it('should call login method of AzureService on login', () => {
    component.login();
    expect(mockAzureService.login).toHaveBeenCalled();
  });

  it('should call logout method of AzureService on logout', () => {
    component.logout();
    expect(mockAzureService.logout).toHaveBeenCalled();
  });`;

      const createTestRegex = /it\(['"](should create the (app|component))['"],[\s\S]*?expect\((app|component)\)\.toBeTruthy\(\);[\s\S]*?\}\);/;
      sourceText = sourceText.replace(createTestRegex, (match) => match + newTests);
      context.logger.info('Added new test cases');
    }

    tree.overwrite(appComponentSpecPath, sourceText);
    context.logger.info(`Updated ${appComponentSpecPath} successfully`);
    
    return tree;
  };
}

function addAzureConfigToAppConfig(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const appConfigPath = 'src/app/app.config.ts';
    let sourceText = readFileContent(tree, appConfigPath, context);
    if (!sourceText) return tree;
    
    const sourceFile = ts.createSourceFile(appConfigPath, sourceText, ts.ScriptTarget.Latest, true);

    sourceText = ensureImport(sourceText, sourceFile, 'AppConfigService', './services/app-config.service');
    sourceText = ensureImport(sourceText, sourceFile, 'msalProviders', './azure.config');

    // Update existing provideAppInitializer to include AppConfigService
    const existingInitializer = /provideAppInitializer\(\(\)\s*=>\s*{\s*const iconService = inject\(IconRegistryService\);\s*return iconService\.registerIconsFromManifest\('assets\/icons\.json'\);\s*}\)/;
    
    if (sourceText.match(existingInitializer)) {
      const updatedInitializer = `provideAppInitializer(() => {
      const appConfigService = inject(AppConfigService);
      const iconService = inject(IconRegistryService);
      return appConfigService.loadConfig().then(() => 
        iconService.registerIconsFromManifest('assets/icons.json')
      );
    })`;
      
      sourceText = sourceText.replace(existingInitializer, updatedInitializer);
      context.logger.info('Updated provideAppInitializer to include AppConfigService');
    }

    // Add msalProviders if not present
    if (!sourceText.includes('...msalProviders')) {
      const providersMatch = sourceText.match(/providers:\s*\[([\s\S]*?)\]/);
      if (providersMatch) {
        const providersContent = providersMatch[1].trim();
        const needsComma = providersContent.length > 0 && !providersContent.endsWith(',');
        
        const updatedProviders = providersContent.length > 0
          ? `${providersContent}${needsComma ? ',' : ''}\n    ...msalProviders`
          : '...msalProviders';
        
        sourceText = sourceText.replace(providersMatch[0], `providers: [\n    ${updatedProviders}\n  ]`);
        context.logger.info('Added msalProviders to app.config.ts');
      }
    }

    tree.overwrite(appConfigPath, sourceText);
    context.logger.info(`Updated ${appConfigPath} successfully`);
    
    return tree;
  };
}

// Helper functions

function readFileContent(tree: Tree, filePath: string, context: SchematicContext): string | null {
  if (!tree.exists(filePath)) {
    context.logger.error(`File ${filePath} does not exist.`);
    return null;
  }
  
  const buffer = tree.read(filePath);
  if (!buffer) {
    context.logger.error(`Could not read file ${filePath}.`);
    return null;
  }
  
  return buffer.toString('utf-8');
}

function ensureImport(
  sourceText: string,
  sourceFile: ts.SourceFile,
  importName: string,
  fromModule: string,
  existingImportToExtend?: string,
  additionalImport?: string
): string {
  const hasImport = sourceFile.statements.some(
    (node) => ts.isImportDeclaration(node) && node.getText().includes(importName)
  );
  
  if (hasImport) return sourceText;

  if (existingImportToExtend) {
    const importRegex = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"]${existingImportToExtend.replace(/\//g, '\\/')}['"]`);
    const match = sourceText.match(importRegex);
    if (match) {
      const imports = match[1].split(',').map(i => i.trim()).filter(i => i);
      if (!imports.includes(importName)) {
        imports.push(importName);
        if (additionalImport && !imports.includes(additionalImport)) {
          imports.push(additionalImport);
        }
        return sourceText.replace(match[0], `import { ${imports.join(', ')} } from '${existingImportToExtend}'`);
      }
    }
  }

  const importStatement = additionalImport
    ? `import { ${importName}, ${additionalImport} } from '${fromModule}';\n`
    : `import { ${importName} } from '${fromModule}';\n`;
  
  return importStatement + sourceText;
}

function ensureMethodWithContent(
  sourceText: string,
  sourceFile: ts.SourceFile,
  methodName: string,
  requiredContent: string,
  context: SchematicContext
): string {
  if (hasMethod(sourceFile, methodName)) {
    if (!sourceText.includes(requiredContent)) {
      sourceText = updateMethod(sourceText, methodName, requiredContent);
      context.logger.info(`Updated ${methodName} method`);
    }
  } else {
    sourceText = addMethod(sourceText, `${methodName}(): void {\n    ${requiredContent}\n  }`);
    context.logger.info(`Added ${methodName} method`);
  }
  return sourceText;
}

function hasMethod(sourceFile: ts.SourceFile, methodName: string): boolean {
  let found = false;
  
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && node.name && node.name.getText() === methodName) {
      found = true;
    }
    if (!found) ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return found;
}

function hasConstructor(sourceFile: ts.SourceFile): boolean {
  let found = false;
  
  function visit(node: ts.Node) {
    if (ts.isConstructorDeclaration(node)) {
      found = true;
    }
    if (!found) ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return found;
}

function updateConstructor(sourceText: string): string {
  const constructorRegex = /constructor\s*\(([^)]*)\)\s*{([^}]*)}/;
  const match = sourceText.match(constructorRegex);
  
  if (!match) return sourceText;
  
  const params = match[1].trim();
  const body = match[2];
  
  if (params.includes('azureService')) return sourceText;
  
  const newParams = params
    ? `${params}, private azureService: AzureService`
    : 'private azureService: AzureService';
  
  return sourceText.replace(constructorRegex, `constructor(${newParams}) {${body}}`);
}

function addConstructor(sourceText: string): string {
  const classRegex = /export\s+class\s+\w+[^{]*{/;
  return sourceText.replace(classRegex, (match) => 
    `${match}\n  constructor(private azureService: AzureService) {}\n`
  );
}

function updateMethod(sourceText: string, methodName: string, requiredCode: string): string {
  const methodRegex = new RegExp(`${methodName}\\s*\\([^)]*\\)\\s*(?::\\s*\\w+)?\\s*{`);
  const match = sourceText.match(methodRegex);
  
  if (!match) return sourceText;
  
  const startIdx = match.index! + match[0].length;
  let braceCount = 1;
  let endIdx = startIdx;
  
  while (braceCount > 0 && endIdx < sourceText.length) {
    if (sourceText[endIdx] === '{') braceCount++;
    if (sourceText[endIdx] === '}') braceCount--;
    endIdx++;
  }
  
  const methodBody = sourceText.substring(startIdx, endIdx - 1);
  const requiredLines = requiredCode.split('\n').map(l => l.trim()).filter(l => l);
  const existingLines = methodBody.split('\n').map(l => l.trim()).filter(l => l);
  
  const linesToAdd = requiredLines.filter(
    line => !existingLines.some(existing => existing.includes(line))
  );
  
  if (linesToAdd.length === 0) return sourceText;
  
  const updatedBody = methodBody.trimEnd() + `\n    ${linesToAdd.join('\n    ')}\n  `;
  
  return sourceText.substring(0, startIdx) + updatedBody + sourceText.substring(endIdx - 1);
}

function addMethod(sourceText: string, methodCode: string): string {
  const sourceFile = ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true);
  
  let classNode: ts.ClassDeclaration | undefined;
  ts.forEachChild(sourceFile, function visit(node) {
    if (ts.isClassDeclaration(node)) {
      classNode = node;
    } else {
      ts.forEachChild(node, visit);
    }
  });
  
  if (classNode && classNode.getEnd) {
    const classEndPos = classNode.getEnd() - 1;
    return sourceText.slice(0, classEndPos) + `\n\n  ${methodCode}\n` + sourceText.slice(classEndPos);
  }
  
  return sourceText;
}

function addProperty(sourceText: string, propertyCode: string): string {
  const classRegex = /export\s+class\s+\w+[^{]*{\s*\n/;
  return sourceText.replace(classRegex, (match) => `${match}  ${propertyCode}\n\n`);
}

function addOnInitInterface(sourceText: string): string {
  if (sourceText.match(/implements\s+[^{]*OnInit/)) {
    return sourceText;
  }
  
  const withInterfaces = /export\s+class\s+(\w+)\s+implements\s+([^{]+)\s*{/;
  const withoutInterfaces = /export\s+class\s+(\w+)\s*{/;
  
  const interfaceMatch = sourceText.match(withInterfaces);
  if (interfaceMatch) {
    const className = interfaceMatch[1];
    const interfaces = interfaceMatch[2].trim();
    return sourceText.replace(withInterfaces, `export class ${className} implements ${interfaces}, OnInit {`);
  }
  
  return sourceText.replace(withoutInterfaces, (_, className) => 
    `export class ${className} implements OnInit {`
  );
}