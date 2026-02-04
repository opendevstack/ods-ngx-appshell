import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { join } from 'path';

export function ngAdd(): Rule {
    return (_tree: Tree, context: SchematicContext) => {
        context.logger.info('Adding ngx-appshell to your project');
        context.logger.info('Installing packages...');
        context.addTask(new NodePackageInstallTask());
  
        return chain([
            updateIndexHtml(),
            createFontsFile(),
            updateStylesScss(),
            updateAngularJson(),
            addRequiredProvidersInAppConfig(),
            updateAppComponent()
        ]);
    }
}

function updateIndexHtml(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const indexPath = 'src/index.html';
        let content = readFileContent(tree, indexPath, context);
        if (!content) return tree;

        // Add Google Fonts link to head if not present
        const fontsLink = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200" />';
        if (!content.includes('fonts.googleapis.com/css2?family=Material+Symbols+Outlined')) {
            const headMatch = content.match(/<head([^>]*)>/);
            if (headMatch) {
                const headTag = headMatch[0];
                content = content.replace(headTag, `${headTag}\n  ${fontsLink}`);
                context.logger.info(`Added Google Fonts link to head in ${indexPath}.`);
            } else {
                context.logger.warn(`Could not find head tag in ${indexPath}.`);
            }
        } else {
            context.logger.info(`Google Fonts link already present in ${indexPath}.`);
        }

        // Add mat-typography class to body if not present
        const bodyMatch = content.match(/<body([^>]*)>/);
        if (!bodyMatch) {
            context.logger.error(`Could not find body tag in ${indexPath}.`);
            tree.overwrite(indexPath, content);
            return tree;
        }

        const [bodyTag, bodyAttrs = ''] = bodyMatch;

        if (bodyAttrs.includes('mat-typography')) {
            context.logger.info(`Class "mat-typography" already present in body tag.`);
        } else {
            const newBodyTag = bodyAttrs.includes('class="')
                ? bodyTag.replace(/class="([^"]*)"/, 'class="$1 mat-typography"')
                : bodyTag.replace(/<body/, '<body class="mat-typography"');

            content = content.replace(bodyTag, newBodyTag);
            context.logger.info(`Added class "mat-typography" to body tag in ${indexPath}.`);
        }

        tree.overwrite(indexPath, content);
        return tree;
    };
}

function createFontsFile(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const fontsPath = 'src/_fonts.scss';
        
        const templatePath = join(__dirname, 'files/_fonts.scss');
        const templateContent = readFileSync(templatePath, 'utf-8');

        tree.create(fontsPath, templateContent);
        context.logger.info(`Created ${fontsPath}.`);
        
        return tree;
    };
}

function updateStylesScss(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const stylesPath = 'src/styles.scss';
        if (!tree.exists(stylesPath)) {
            context.logger.error(`File ${stylesPath} does not exist.`);
            return tree;
        }

        const templatePath = join(__dirname, 'files/styles.scss');
        const templateContent = readFileSync(templatePath, 'utf-8');

        tree.overwrite(stylesPath, templateContent);
        context.logger.info(`Replaced ${stylesPath} with required imports and styles.`);
        
        return tree;
    };
}

function updateAngularJson(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const angularJsonPath = 'angular.json';
        const content = readFileContent(tree, angularJsonPath, context);
        if (!content) return tree;

        const angularJson = JSON.parse(content);
        const paletteStyle = 'node_modules/@opendevstack/ngx-appshell/styles/palette.css';
        const stylePreprocessorPath = 'node_modules/@opendevstack/ngx-appshell';
        
        let updated = false;
        const projects = angularJson.projects;
        
        for (const projectName in projects) {
            const project = projects[projectName];
            const buildOptions = project?.architect?.build?.options;
            const productionConfig = project?.architect?.build?.configurations?.production;
            const testOptions = project?.architect?.test?.options;
            
            if (buildOptions) {
                // Add palette.css to styles array
                if (Array.isArray(buildOptions.styles)) {
                    if (!buildOptions.styles.includes(paletteStyle)) {
                        buildOptions.styles.push(paletteStyle);
                        updated = true;
                        context.logger.info(`Added palette.css to styles in project "${projectName}".`);
                    } else {
                        context.logger.info(`palette.css already present in project "${projectName}".`);
                    }
                }

                // Add stylePreprocessorOptions
                if (!buildOptions.stylePreprocessorOptions) {
                    buildOptions.stylePreprocessorOptions = { includePaths: [] };
                }
                if (!buildOptions.stylePreprocessorOptions.includePaths) {
                    buildOptions.stylePreprocessorOptions.includePaths = [];
                }
                
                if (!buildOptions.stylePreprocessorOptions.includePaths.includes(stylePreprocessorPath)) {
                    buildOptions.stylePreprocessorOptions.includePaths.push(stylePreprocessorPath);
                    updated = true;
                    context.logger.info(`Added stylePreprocessorOptions includePath in project "${projectName}".`);
                } else {
                    context.logger.info(`stylePreprocessorOptions includePath already present in project "${projectName}".`);
                }
            }

            // Clear styles in test configuration
            if (testOptions) {
                if (!testOptions.styles || testOptions.styles.length > 0) {
                    testOptions.styles = [];
                    updated = true;
                    context.logger.info(`Cleared test styles in project "${projectName}".`);
                }
            }

            // Update budgets in production configuration
            if (productionConfig) {
                if (!productionConfig.budgets) {
                    productionConfig.budgets = [];
                }

                const requiredBudgets = [
                    { type: 'initial', maximumWarning: '2MB', maximumError: '4MB' },
                    { type: 'anyComponentStyle', maximumWarning: '2kB', maximumError: '4kB' }
                ];

                for (const requiredBudget of requiredBudgets) {
                    const existingBudget = productionConfig.budgets.find((b: any) => b.type === requiredBudget.type);
                    
                    if (existingBudget) {
                        const warningUpdated = updateBudgetValue(existingBudget, 'maximumWarning', requiredBudget.maximumWarning);
                        const errorUpdated = updateBudgetValue(existingBudget, 'maximumError', requiredBudget.maximumError);
                        
                        if (warningUpdated || errorUpdated) {
                            updated = true;
                            context.logger.info(`Updated ${requiredBudget.type} budget in project "${projectName}".`);
                        }
                    } else {
                        productionConfig.budgets.push(requiredBudget);
                        updated = true;
                        context.logger.info(`Added ${requiredBudget.type} budget in project "${projectName}".`);
                    }
                }
            }
        }
        
        if (updated) {
            tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
        }
        
        return tree;
    };
}

function updateBudgetValue(budget: any, key: string, minValue: string): boolean {
    const parseSize = (size: string): number => {
        const units: any = { B: 1, kB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
        const match = size.match(/^(\d+(?:\.\d+)?)\s*(B|kB|MB|GB)$/);
        if (!match) return 0;
        return parseFloat(match[1]) * units[match[2]];
    };

    const currentSize = parseSize(budget[key] || '0B');
    const requiredSize = parseSize(minValue);

    if (currentSize < requiredSize) {
        budget[key] = minValue;
        return true;
    }

    return false;
}

function addRequiredProvidersInAppConfig(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const appConfigPath = 'src/app/app.config.ts';
        let content = readFileContent(tree, appConfigPath, context);
        if (!content) return tree;

        let sourceFile = ts.createSourceFile(appConfigPath, content, ts.ScriptTarget.Latest, true);

        content = addProviderIfMissing(
            content,
            sourceFile,
            'provideAnimations',
            `import { provideAnimations } from '@angular/platform-browser/animations';`,
            'provideAnimations()',
            context
        );

        sourceFile = ts.createSourceFile(appConfigPath, content, ts.ScriptTarget.Latest, true);
        content = addProviderIfMissing(
            content,
            sourceFile,
            'provideHttpClient',
            `import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';`,
            'provideHttpClient(withInterceptorsFromDi(), withFetch())',
            context
        );

        sourceFile = ts.createSourceFile(appConfigPath, content, ts.ScriptTarget.Latest, true);
        content = addObjectProviderIfMissing(
            content,
            sourceFile,
            'MAT_FORM_FIELD_DEFAULT_OPTIONS',
            `import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';`,
            `{\n      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,\n      useValue: {\n        subscriptSizing: 'dynamic'\n      }\n    }`,
            context
        );

        sourceFile = ts.createSourceFile(appConfigPath, content, ts.ScriptTarget.Latest, true);
        content = addAppInitializerProviderIfMissing(content, sourceFile, context);

        tree.overwrite(appConfigPath, content);
        context.logger.info(`Added required imports and providers in ${appConfigPath}.`);
        
        return tree;
    };
}

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

function addProviderIfMissing(
    content: string,
    sourceFile: ts.SourceFile,
    importName: string,
    importStatement: string,
    providerCall: string,
    context: SchematicContext
): string {
    const hasImport = sourceFile.statements.some(
        (node) => ts.isImportDeclaration(node) && node.getText().includes(importName)
    );
    
    if (hasImport) return content;

    const providersMatch = content.match(/providers:\s*\[([\s\S]*?)\]/);
    if (!providersMatch) {
        context.logger.warn('Could not locate providers array to update');
        return content;
    }

    const providersContent = providersMatch[1].trim();
    const needsComma = providersContent.length > 0 && !providersContent.endsWith(',');
    
    const updatedProviders = providersContent.length > 0
        ? `${providersContent}${needsComma ? ',' : ''}\n    ${providerCall}`
        : providerCall;

    content = `${importStatement}\n${content}`;
    content = content.replace(providersMatch[0], `providers: [\n    ${updatedProviders}\n  ]`);
    
    context.logger.info(`Updated providers array to include ${importName}`);
    return content;
}

function addObjectProviderIfMissing(
    content: string,
    sourceFile: ts.SourceFile,
    importName: string,
    importStatement: string,
    providerObject: string,
    context: SchematicContext
): string {
    const hasImport = sourceFile.statements.some(
        (node) => ts.isImportDeclaration(node) && node.getText().includes(importName)
    );
    
    if (hasImport) {
        context.logger.info(`${importName} already imported, skipping provider addition`);
        return content;
    }

    const providersMatch = content.match(/providers:\s*\[([\s\S]*?)\]/);
    if (!providersMatch) {
        context.logger.warn('Could not locate providers array to update');
        return content;
    }

    const providersContent = providersMatch[1].trim();
    const needsComma = providersContent.length > 0 && !providersContent.endsWith(',');
    
    const updatedProviders = providersContent.length > 0
        ? `${providersContent}${needsComma ? ',' : ''}\n    ${providerObject}`
        : providerObject;

    content = `${importStatement}\n${content}`;
    content = content.replace(providersMatch[0], `providers: [\n    ${updatedProviders}\n  ]`);
    
    context.logger.info(`Updated providers array to include ${importName}`);
    return content;
}

function addAppInitializerProviderIfMissing(
    content: string,
    sourceFile: ts.SourceFile,
    context: SchematicContext
): string {
    const hasIconRegistryImport = sourceFile.statements.some(
        (node) => ts.isImportDeclaration(node) && node.getText().includes('IconRegistryService')
    );
    
    if (hasIconRegistryImport) {
        context.logger.info('IconRegistryService already imported, skipping app initializer provider');
        return content;
    }

    const providersMatch = content.match(/providers:\s*\[([\s\S]*?)\]/);
    if (!providersMatch) {
        context.logger.warn('Could not locate providers array to update');
        return content;
    }

    const providersContent = providersMatch[1].trim();
    const needsComma = providersContent.length > 0 && !providersContent.endsWith(',');
    
    const providerCode = `provideAppInitializer(() => {\n      const iconService = inject(IconRegistryService);\n      return iconService.registerIconsFromManifest('assets/icons.json');\n    })`;
    
    const updatedProviders = providersContent.length > 0
        ? `${providersContent}${needsComma ? ',' : ''}\n    ${providerCode}`
        : providerCode;

    // Add necessary imports
    const hasProvideAppInitializer = sourceFile.statements.some(
        (node) => ts.isImportDeclaration(node) && node.getText().includes('provideAppInitializer')
    );
    const hasInject = sourceFile.statements.some(
        (node) => ts.isImportDeclaration(node) && node.getText().includes('inject')
    );

    if (!hasProvideAppInitializer || !hasInject) {
        // Check if there's already an import from @angular/core
        const coreImportMatch = content.match(/import\s*{([^}]*)}\s*from\s*['"]@angular\/core['"]/);
        if (coreImportMatch) {
            const imports = coreImportMatch[1].split(',').map(i => i.trim());
            const missingImports = [];
            if (!hasProvideAppInitializer && !imports.includes('provideAppInitializer')) {
                missingImports.push('provideAppInitializer');
            }
            if (!hasInject && !imports.includes('inject')) {
                missingImports.push('inject');
            }
            if (missingImports.length > 0) {
                const updatedImports = [...imports, ...missingImports].join(', ');
                content = content.replace(coreImportMatch[0], `import { ${updatedImports} } from '@angular/core'`);
            }
        } else {
            const neededImports = [];
            if (!hasProvideAppInitializer) neededImports.push('provideAppInitializer');
            if (!hasInject) neededImports.push('inject');
            content = `import { ${neededImports.join(', ')} } from '@angular/core';\n${content}`;
        }
    }

    content = `import { IconRegistryService } from '@opendevstack/ngx-appshell';\n${content}`;
    content = content.replace(providersMatch[0], `providers: [\n    ${updatedProviders}\n  ]`);
    
    context.logger.info('Updated providers array to include icon registry app initializer');
    return content;
}
function updateAppComponent(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const appComponentPath = 'src/app/app.component.ts';
        let content = readFileContent(tree, appComponentPath, context);
        if (!content) return tree;

        let sourceFile = ts.createSourceFile(appComponentPath, content, ts.ScriptTarget.Latest, true);

        // Check if MatIconRegistry is already imported
        const hasMatIconRegistryImport = sourceFile.statements.some(
            (node) => ts.isImportDeclaration(node) && node.getText().includes('MatIconRegistry')
        );

        if (hasMatIconRegistryImport) {
            context.logger.info('MatIconRegistry already imported in app.component.ts, skipping update');
            return tree;
        }

        // Add MatIconRegistry import
        const matIconRegistryImport = `import { MatIconRegistry } from '@angular/material/icon';`;
        const firstImportMatch = content.match(/^import\s/m);
        if (firstImportMatch) {
            content = `${matIconRegistryImport}\n${content}`;
        }

        // Add MatIconRegistry to constructor parameters or create constructor if it doesn't exist
        const constructorMatch = content.match(/constructor\s*\(([^)]*)\)/);
        if (constructorMatch) {
            const params = constructorMatch[1].trim();
            const needsComma = params.length > 0 && !params.endsWith(',');
            const newParam = 'private matIconReg: MatIconRegistry';
            
            const updatedParams = params.length > 0
                ? `${params}${needsComma ? ',' : ''}\n    ${newParam}`
                : newParam;
            
            content = content.replace(constructorMatch[0], `constructor(\n    ${updatedParams}\n  )`);
            context.logger.info('Added MatIconRegistry parameter to constructor');
        } else {
            // No constructor exists, create one
            const classBodyMatch = content.match(/export\s+class\s+\w+[^{]*\{/);
            if (classBodyMatch) {
                const classBodyStart = content.indexOf(classBodyMatch[0]) + classBodyMatch[0].length;
                const beforeClassBody = content.substring(0, classBodyStart);
                const afterClassBody = content.substring(classBodyStart);
                
                const newConstructor = `\n\n  constructor(private matIconReg: MatIconRegistry) {}\n`;
                content = `${beforeClassBody}${newConstructor}${afterClassBody}`;
                context.logger.info('Created constructor with MatIconRegistry parameter');
            } else {
                context.logger.warn('Could not find class declaration in app.component.ts');
                return tree;
            }
        }

        // Check if class implements OnInit
        const classMatch = content.match(/export\s+class\s+\w+\s+implements\s+([^{]+)\{/);
        const implementsOnInit = classMatch && classMatch[1].includes('OnInit');

        if (!implementsOnInit) {
            // Add OnInit to implements clause
            if (classMatch) {
                const interfaces = classMatch[1].trim();
                const updatedInterfaces = interfaces.length > 0
                    ? `${interfaces}, OnInit`
                    : 'OnInit';
                content = content.replace(classMatch[0], classMatch[0].replace(classMatch[1], ` ${updatedInterfaces} `));
                context.logger.info('Added OnInit interface to class');
            } else {
                // No implements clause, add one
                const classDeclarationMatch = content.match(/export\s+class\s+\w+\s*\{/);
                if (classDeclarationMatch) {
                    content = content.replace(classDeclarationMatch[0], classDeclarationMatch[0].replace('{', 'implements OnInit {'));
                    context.logger.info('Added OnInit interface to class');
                }
            }

            // Check if OnInit is imported
            const coreImportMatch = content.match(/import\s*{([^}]*)}\s*from\s*['"]@angular\/core['"]/);
            if (coreImportMatch) {
                const imports = coreImportMatch[1].split(',').map(i => i.trim());
                if (!imports.includes('OnInit')) {
                    const updatedImports = [...imports, 'OnInit'].join(', ');
                    content = content.replace(coreImportMatch[0], `import { ${updatedImports} } from '@angular/core'`);
                    context.logger.info('Added OnInit to @angular/core imports');
                }
            }
        }

        // Add or update ngOnInit method
        const ngOnInitMatch = content.match(/ngOnInit\s*\(\s*\)\s*:\s*\w+\s*\{/);
        if (ngOnInitMatch) {
            // ngOnInit exists, add the setDefaultFontSetClass call at the beginning
            const methodBodyStart = content.indexOf('{', content.indexOf('ngOnInit'));
            const insertPosition = methodBodyStart + 1;
            const beforeInsert = content.substring(0, insertPosition);
            const afterInsert = content.substring(insertPosition);
            
            content = `${beforeInsert}\n    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');${afterInsert}`;
            context.logger.info('Added setDefaultFontSetClass call to existing ngOnInit method');
        } else {
            // ngOnInit doesn't exist, create it after the constructor
            const constructorMatch = content.match(/constructor\s*\([^)]*\)\s*\{/);
            if (constructorMatch) {
                const constructorStartIndex = content.indexOf(constructorMatch[0]);
                const constructorBodyStart = constructorStartIndex + constructorMatch[0].length;
                
                // Find the matching closing brace for the constructor using brace counting
                let braceCount = 1;
                let constructorEnd = constructorBodyStart;
                
                for (let i = constructorBodyStart; i < content.length && braceCount > 0; i++) {
                    if (content[i] === '{') {
                        braceCount++;
                    } else if (content[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            constructorEnd = i + 1;
                            break;
                        }
                    }
                }
                
                const beforeConstructor = content.substring(0, constructorEnd);
                const afterConstructor = content.substring(constructorEnd);
                
                const ngOnInitMethod = `\n\n  ngOnInit(): void {\n    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');\n  }`;
                content = `${beforeConstructor}${ngOnInitMethod}${afterConstructor}`;
                context.logger.info('Created ngOnInit method with setDefaultFontSetClass call');
            } else {
                context.logger.warn('Could not find suitable location to add ngOnInit method');
            }
        }

        tree.overwrite(appComponentPath, content);
        context.logger.info(`Updated ${appComponentPath} with MatIconRegistry configuration`);
        
        return tree;
    };
}
