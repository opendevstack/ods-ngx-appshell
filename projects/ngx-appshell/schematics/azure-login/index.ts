import { apply, applyTemplates, chain, externalSchematic, MergeStrategy, mergeWith, move, Rule, Tree, url } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';

function addAzureServiceToAppComponent(tree: Tree): void {
    const appComponentPath = 'src/app/app.component.ts';
    const text = tree.read(appComponentPath);
    if (!text) throw new Error(`File ${appComponentPath} does not exist.`);
    const sourceText = text.toString('utf-8');

    const emptyConstructorMatch = sourceText.match(/constructor\(\) {}/);
    if (!emptyConstructorMatch) throw new Error(`You need an empty constructor method in app.component.ts.`);

    const emptyNgOnInitMatch = sourceText.match(/ngOnInit\(\): void {}/);
    if (!emptyNgOnInitMatch) throw new Error(`You need an empty ngOnInit method in app.component.ts.`);
    
    const emptyLoginMatch = sourceText.match(/login\(\) {}/);
    if (!emptyLoginMatch) throw new Error(`You need an empty login method in app.component.ts.`);

    const emptyLogoutMatch = sourceText.match(/logout\(\) {}/);
    if (!emptyLogoutMatch) throw new Error(`You need an empty logout method in app.component.ts.`);

    let updatedSourceText = sourceText.replace('constructor() {}', 'constructor(private azureService: AzureService) {}');
    updatedSourceText = updatedSourceText.replace('ngOnInit(): void {}', `ngOnInit(): void {\n\t\tthis.azureService.initialize();\n\t\tthis.azureService.loggedUser$.subscribe((user) => {\n\t\t\tthis.loggedUser = user\n\t\t});\n\t}`);
    updatedSourceText = updatedSourceText.replace('login() {}', `login() { this.azureService.login(); }`);
    updatedSourceText = updatedSourceText.replace('logout() {}', `logout() { this.azureService.logout(); }`);

    const recorder = tree.beginUpdate(appComponentPath);
    recorder.insertLeft(0, `import { AzureService } from './services/azure.service';\n`);
    recorder.remove(0, sourceText.length);
    recorder.insertLeft(0, updatedSourceText);
    tree.commitUpdate(recorder);
}

function addTestsToAppComponent(tree: Tree): void {
    const appComponentPath = 'src/app/app.component.spec.ts';
    const text = tree.read(appComponentPath);
    if (!text) throw new Error(`File ${appComponentPath} does not exist.`);
    const sourceText = text.toString('utf-8');

    const oldBeforeEach = `beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, BrowserAnimationsModule],
    }).compileComponents();
  });`;

    const newBeforeEach = `let mockAzureService: jasmine.SpyObj<AzureService>;

  beforeEach(async () => {
    mockAzureService = jasmine.createSpyObj('AzureService', ['initialize', 'login', 'logout'], { loggedUser$: of(null) });

    await TestBed.configureTestingModule({
      imports: [AppComponent, BrowserAnimationsModule],
      providers: [
        { provide: AzureService, useValue: mockAzureService },
        provideHttpClient()
      ]
    }).compileComponents();
  });`;

    const oldTests = `it('should create the component', () => {
    expect(component).toBeTruthy();
  });`;

    const newTests = `it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the service and subscribe to loggedUser$ on ngOnInit', () => {
    component.ngOnInit();
    expect(mockAzureService.initialize).toHaveBeenCalled();
    expect(component.loggedUser).toBeNull();
  });

  it('should call login method of AppShellAzureService on login', () => {
    component.login();
    expect(mockAzureService.login).toHaveBeenCalled();
  });

  it('should call logout method of AppShellAzureService on logout', () => {
    component.logout();
    expect(mockAzureService.logout).toHaveBeenCalled();
  });`;
  

    let updatedSourceText = sourceText.replace(oldBeforeEach, newBeforeEach);
    updatedSourceText = updatedSourceText.replace(oldTests, newTests);

    const recorder = tree.beginUpdate(appComponentPath);
    recorder.insertLeft(0, `import { AzureService } from './services/azure.service';\n`);
    recorder.insertLeft(0, `import { of } from 'rxjs';\n`);
    recorder.insertLeft(0, `import { provideHttpClient } from '@angular/common/http';\n`);
    recorder.remove(0, sourceText.length);
    recorder.insertLeft(0, updatedSourceText);
    tree.commitUpdate(recorder);
}

function addAzureConfigToAppConfig(tree: Tree): void {
    const appConfigPath = `/src/app/app.config.ts`;
    const text = tree.read(appConfigPath);
    if (!text) throw new Error(`File ${appConfigPath} does not exist.`);
    
    const sourceText = text.toString('utf-8');
    
    const providersArrayMatch = sourceText.match(/providers: \[((?:[^\[\]]|\[(?:[^\[\]]|\[[^\[\]]*\])*\])*)\]/);
    if (!providersArrayMatch) throw new Error(`Providers array not found in ${appConfigPath}.`);
    
    const newProviders = `{
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfigService],
      multi: true,
    },
    ...msalProviders`

    const providersArrayContent = providersArrayMatch[1].trim();
    const updatedProvidersArrayContent = providersArrayContent ? `${providersArrayContent},\n\t\t${newProviders}` : `\n${newProviders}`;
    let updatedSourceText = sourceText.replace(providersArrayMatch[0], `providers: [\n\t\t${updatedProvidersArrayContent}\n]`);

    updatedSourceText += `\n\nexport function initConfig(appConfig: AppConfigService) {
  return () => appConfig.loadConfig();
}`;
        
    const recorder = tree.beginUpdate(appConfigPath);
    recorder.insertLeft(0, `import { AppConfigService } from './services/app-config.service';\n`);
    recorder.insertLeft(0, `import { msalProviders } from './azure.config';\n`);
    recorder.remove(0, sourceText.length);
    recorder.insertLeft(0, updatedSourceText);
    tree.commitUpdate(recorder);
}

export function azureLoginGenerator(): Rule {
    return () => {
        console.log(`Integrating azure login into the project`);

        const azureServiceTemplateSource = apply(
            url('./files/azure-service'),
            [
                applyTemplates({}),
                move(normalize(`/src/app/services`))
            ]
        )

        const appConfigServiceTemplateSource = apply(
            url('./files/app-config-service'),
            [
                applyTemplates({}),
                move(normalize(`/src/app/services`))
            ]
        )

        const azureConfigTemplateSource = apply(
            url('./files/azure-config'),
            [
                applyTemplates({}),
                move(normalize(`/src/app`))
            ]
        )

        const appConfigTemplateSource = apply(
            url('./files/app-config'),
            [
                applyTemplates({}),
                move(normalize(`/public/config`))
            ]
        )
        
        return chain([
            externalSchematic('@schematics/angular', 'service', {name: 'azure', path: `src/app/services`}),
            mergeWith(azureServiceTemplateSource, MergeStrategy.Overwrite),
            externalSchematic('@schematics/angular', 'service', {name: 'app-config', path: `/src/app/services`}),
            mergeWith(appConfigServiceTemplateSource, MergeStrategy.Overwrite),
            mergeWith(azureConfigTemplateSource, MergeStrategy.Overwrite),
            mergeWith(appConfigTemplateSource, MergeStrategy.Overwrite),
            (tree: Tree) => {
                addAzureServiceToAppComponent(tree);
                addTestsToAppComponent(tree);
                addAzureConfigToAppConfig(tree);
                return tree;
            }
        ])
    }
}