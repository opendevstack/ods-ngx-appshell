import { apply, applyTemplates, chain, externalSchematic, MergeStrategy, mergeWith, move,
  Rule, SchematicContext, Tree, url } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import * as ts from 'typescript';

import { applyToUpdateRecorder, Change, InsertChange, NoopChange, ReplaceChange } from '@schematics/angular/utility/change';

export function natsNotificationsGenerator(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info('Integrating Nats notifications into the project');
    
    const natsServiceTemplateSource = apply(
      url('./files/nats-service'),
      [ applyTemplates({}), move(normalize(`/src/app/services`)) ]
    );

    const notificationsScreenTemplateSource = apply(
      url('./files/notifications-screen'),
      [ applyTemplates({}), move(normalize(`/src/app/screens/notifications-screen`)) ]
    )
    
    return chain([
      externalSchematic('@schematics/angular', 'service', { name: 'nats', path: `src/app/services`}),
      mergeWith(natsServiceTemplateSource, MergeStrategy.Overwrite),
      externalSchematic('@schematics/angular', 'component', {name: 'notifications-screen', path: `src/app/screens`, style: 'scss'}),
      mergeWith(notificationsScreenTemplateSource, MergeStrategy.Overwrite),
      (tree: Tree) => {
        addRouteToAppRoutes(tree, 'NotificationsScreenComponent', 'notifications', './screens/notifications-screen/notifications-screen.component');
        addPropertiesToAppShellConfiguration(tree);
        addToastsToAppComponentUI(tree);
        integrateNotificationsInAppComponent(tree);
        integrateNotificationsInAppComponentTests(tree);
        addMarkdownProviderToAppConfig(tree);
        return tree;
      }
    ]);
  };
}

function addMarkdownProviderToAppConfig(tree: Tree): void {
    const appConfigPath = `/src/app/app.config.ts`;
    const text = tree.read(appConfigPath);
    if (!text) throw new Error(`File ${appConfigPath} does not exist.`);
    
    const sourceText = text.toString('utf-8');
    const providersArrayMatch = sourceText.match(/providers: \[((?:[^\[\]]|\[(?:[^\[\]]|\[[^\[\]]*\])*\])*)\]/);
    if (!providersArrayMatch) throw new Error(`Providers array not found in ${appConfigPath}.`);
    
    const newProviders = `provideMarkdown()`

    const providersArrayContent = providersArrayMatch[1].trim();
    const updatedProvidersArrayContent = providersArrayContent ? `${providersArrayContent},\n\t\t${newProviders}` : `\n${newProviders}`;
    let updatedSourceText = sourceText.replace(providersArrayMatch[0], `providers: [\n\t\t${updatedProvidersArrayContent}\n]`);
        
    const recorder = tree.beginUpdate(appConfigPath);
    recorder.insertLeft(0, `import { provideMarkdown } from 'ngx-markdown';\n`);
    recorder.remove(0, sourceText.length);
    recorder.insertLeft(0, updatedSourceText);
    tree.commitUpdate(recorder);
}

function addRouteToAppRoutes(tree: Tree, componentName: string, routePath: string, importPath: string): void {
    const appRoutesPath = `src/app/app.routes.ts`;
    const text = tree.read(appRoutesPath);
    if (!text) throw new Error(`File ${appRoutesPath} does not exist.`);
    
    const sourceText = text.toString('utf-8');
    
    const route = `{ path: '${routePath}', component: ${componentName} }`;
    const routesArrayMatch = sourceText.match(/export const routes: Routes = \[([\s\S]*?)\];/);
    if (!routesArrayMatch) throw new Error(`Routes array not found in ${appRoutesPath}.`);
    
    const routesArrayContent = routesArrayMatch[1].trim();
    const updatedRoutesArrayContent = routesArrayContent ? `${routesArrayContent},\n\t${route}` : `\n${route}`;
    const updatedSourceText = sourceText.replace(routesArrayMatch[0], `export const routes: Routes = [\n\t${updatedRoutesArrayContent}\n];`);
        
    const recorder = tree.beginUpdate(appRoutesPath);
    recorder.insertLeft(0, `import { ${componentName} } from '${importPath}';\n`);
    recorder.remove(0, sourceText.length);
    recorder.insertLeft(0, updatedSourceText);
    tree.commitUpdate(recorder);
}

function addPropertiesToAppShellConfiguration(tree: Tree): void {

  const appShellConfigPath = 'src/app/appshell.configuration.ts';
  if (!tree.exists(appShellConfigPath)) {
    throw new Error(`File ${appShellConfigPath} does not exist.`);
  }
  const sourceFile = ts.createSourceFile(
    appShellConfigPath,
    tree.read(appShellConfigPath)!.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );
  const recorder = tree.beginUpdate(appShellConfigPath);

  const classNode = sourceFile.statements.find(ts.isClassDeclaration) as ts.ClassDeclaration;
  if (!classNode) {
    throw new Error(`Class not found in ${appShellConfigPath}.`);
  }

  const existingProperties = classNode.members.filter(ts.isPropertyDeclaration).map(prop => (prop as ts.PropertyDeclaration).name.getText());

  const insertPosition = classNode.end - 1;

  if (!existingProperties.includes('natsUrl')) {
    recorder.insertLeft(insertPosition, `\n    public static natsUrl = 'wss://nats.yourdomain.com';\n`);
  }
  if (!existingProperties.includes('toastLimitInScreen')) {
    recorder.insertLeft(insertPosition, `\n    public static toastLimitInScreen = 3;\n`);
  }
  if (!existingProperties.includes('appShellNotificationsLink')) {
    recorder.insertLeft(insertPosition, `\n    public static appShellNotificationsLink = {\n        anchor: '/notifications',\n        icon: 'notifications'\n    };\n`);
  }

  tree.commitUpdate(recorder);
}

function addToastsToAppComponentUI(tree: Tree): void {
  const templateFilePath = 'src/app/app.component.html';

  if (!tree.exists(templateFilePath)) {
    throw new Error(`File ${templateFilePath} does not exist.`);
  }

  let templateContent = tree.read(templateFilePath)!.toString('utf-8');
  if (!templateContent.includes('<appshell-layout') || templateContent.includes('[appShellNotificationsCount]') || templateContent.includes('<appshell-toasts')) {
    throw new Error(`Template already has integrated notifications elements.`);
  }

  const layoutTagRegex = /<appshell-layout[^>]*>/;
  const layoutTagMatch = templateContent.match(layoutTagRegex);
  if (!layoutTagMatch) {
    throw new Error(`appshell-layout tag not found in ${templateFilePath}.`);
  }

  const originalLayoutTag = layoutTagMatch[0];
  const closingBracketIndex = originalLayoutTag.lastIndexOf('>');

  const updatedLayoutTag = `${originalLayoutTag.substring(0, closingBracketIndex)}\n    [appShellNotificationsLink]="appShellNotificationsLink"\n    [appShellNotificationsCount]="appShellNotificationsCount"\n    >`;
  
  let updatedTemplate = templateContent.replace(originalLayoutTag, updatedLayoutTag);

  if(!updatedTemplate.includes('<appshell-toasts')) {
    const closingLayoutTagIndex = updatedTemplate.indexOf('</appshell-layout>');
    if (closingLayoutTagIndex > -1) {
      const insertPosition = closingLayoutTagIndex + '</appshell-layout>'.length;
      updatedTemplate = updatedTemplate.substring(0, insertPosition) + '\n<appshell-toasts [toastsLimit]="toastLimitInScreen"></appshell-toasts>\n' + updatedTemplate.substring(insertPosition);
    }
  }

  tree.overwrite(templateFilePath, updatedTemplate);
}

function integrateNotificationsInAppComponent(tree: Tree): void {
  const appComponentPath = 'src/app/app.component.ts';
  const content = tree.read(appComponentPath);
  
  if (!content) {
    throw new Error(`File ${appComponentPath} does not exist.`);
  }
  
  const sourceText = content.toString('utf-8');
  const sourceFile = ts.createSourceFile(
    appComponentPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  
  const changes: Change[] = [];

  changes.push(
    updateImport(
      sourceFile, 
      appComponentPath, 
      '@opendevstack/ngx-appshell', 
      ['AppShellLayoutComponent', 'AppShellToastService', 'AppShellToastsComponent', 'AppShellNotification']
    )
  );

  changes.push(addNatsServiceImport(sourceFile,appComponentPath));
  
  changes.push(
    updateImport(
      sourceFile, 
      appComponentPath, 
      'rxjs', 
      ['Subject', 'Subscription']
    )
  );
  
  changes.push(
    updateComponentImports(
      sourceFile,
      appComponentPath,
      ['CommonModule', 'AppShellLayoutComponent', 'AppShellToastsComponent']
    )
  );
  
  changes.push(
    addClassProperties(
      sourceFile,
      appComponentPath,
      [
        'toastLimitInScreen: number = AppShellConfig.toastLimitInScreen;',
        'appShellNotificationsLink: AppShellLink = AppShellConfig.appShellNotificationsLink;',
        'appShellNotificationsCount: number = 0;',
        'private natsUrl: string = AppShellConfig.natsUrl;',
        'private unreadMessagesCountSubscription!: Subscription;',
        'private liveMessageSubscription!: Subscription;'
      ]
    )
  );
  
  changes.push(
    updateConstructor(
      sourceFile,
      appComponentPath,
      ['private azureService: AzureService', 'private toastService: AppShellToastService', 'private natsService: NatsService']
    )
  );
  
  changes.push(
    updateNgOnInit(
      sourceFile,
      appComponentPath,
      `async ngOnInit(): Promise<void> {
  await this.natsService.initialize(this.natsUrl);
  this.azureService.initialize();
  this.azureService.loggedUser$.subscribe((user) => {
    this.loggedUser = user;
    this.initUserNotifications(user);
  });
  this.initializeNatsListeners();
}`
    )
  );
  
  changes.push(
    updateNgOnDestroy(
      sourceFile,
      appComponentPath,
      `ngOnDestroy(): void {
  this._destroying$.next(undefined);
  this._destroying$.complete();
  this.liveMessageSubscription?.unsubscribe();
  this.unreadMessagesCountSubscription?.unsubscribe();
}`
    )
  );
  
  changes.push(
    addMethod(
      sourceFile,
      appComponentPath,
      `private initUserNotifications(user: AppShellUser|null) {
  if(user) {
    // We convert the username to a valid NATS user name based on their validations:
    // validBucketRe = regexp.MustCompile(^[a-zA-Z0-9_-]+$)
    // validKeyRe = regexp.MustCompile(^[-/_=\.a-zA-Z0-9]+$)
    const natsUser = user.username.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_')
    this.natsService.initializeUser(natsUser);
    
    // On login, leave 4 seconds for the NATS connection to be established and show a toast with the unread messages count
    setTimeout(() => {
      if(this.appShellNotificationsCount > 0) {
        const notification = {
          id: new Date().getTime().toString() + '-logged',
          title: \`You have \${this.appShellNotificationsCount} unread notifications\`,
          read: false,
          subject: 'only-toast'
        } as AppShellNotification;
        this.toastService.showToast(notification, 8000);
      }
    }, 4000);
  }
}`
    )
  );
  
  changes.push(
    addMethod(
      sourceFile,
      appComponentPath,
      `private initializeNatsListeners() {
  this.unreadMessagesCountSubscription = this.natsService.unreadMessagesCount$.subscribe((count) => {
    this.appShellNotificationsCount = count;
  });
  this.liveMessageSubscription = this.natsService.liveMessage$.subscribe((message) => {
    if (!message || !message.data) {
      return;
    }
    try {
      if (this.natsService.isValidMessage(message.data)) {
        console.log('Received valid message:', message);
        const notification = {
          id: message.id,
          type: message.data.type,
          title: \`You have 1 new notification\`,
          date: new Date(message.data.date),
          read: message.read,
          subject: message.subject
        };
        // If you want to show the actual notification, you can show message.data instead of notification
        this.toastService.showToast(notification, 8000);
      } else {
        console.log('Invalid message format:', message);
      }
    } catch (error) {
      console.log('Invalid message format:', message);
    }
  });
}`
    )
  );
  
  const recorder = tree.beginUpdate(appComponentPath);
  applyToUpdateRecorder(recorder, changes);
  tree.commitUpdate(recorder);
}

function integrateNotificationsInAppComponentTests(tree: Tree): void {
  const testFilePath = 'src/app/app.component.spec.ts';
  const content = tree.read(testFilePath);
  
  if (!content) {
    throw new Error(`File ${testFilePath} does not exist.`);
  }
  
  const sourceText = content.toString('utf-8');
  const sourceFile = ts.createSourceFile(
    testFilePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Update imports
  const importsToAdd = [
    ['ComponentFixture', 'fakeAsync', 'TestBed', 'tick'],
    ['Subject'],
    ['NatsMessage', 'NatsService'],
    ['AppShellToastsComponent', 'AppShellToastService', 'AppShellUser']
  ];
  
  const importSources = [
    '@angular/core/testing',
    'rxjs',
    './services/nats.service',
    '@opendevstack/ngx-appshell'
  ];
  
  let updatedSource = sourceText;
  
  for (let i = 0; i < importsToAdd.length; i++) {
    const change: Change = updateImport(sourceFile, testFilePath, importSources[i], importsToAdd[i])
    if(change instanceof NoopChange) {
      updatedSource = `import {${importsToAdd[i].join(', ')}} from '${importSources[i]}'\n` + updatedSource;
    } else if (change instanceof ReplaceChange) {
      updatedSource = updatedSource.replace(change.oldText, change.newText);
    }
  }
  
  const describeBlockStart = updatedSource.indexOf('describe(\'AppComponent\'');
  const beforeEachStart = updatedSource.indexOf('beforeEach(', describeBlockStart);
  
  const variablesToAdd = `let mockNatsService: jasmine.SpyObj<NatsService>;
  let mockToastService: jasmine.SpyObj<AppShellToastService>;
  let azureLoggedUser$: Subject<AppShellUser>;
  let natsLiveMessage$: Subject<NatsMessage | null>;
  let natsMessageCount$: Subject<number>;
  `;
  
  if (!updatedSource.includes('mockNatsService') || 
      !updatedSource.includes('mockToastService') || 
      !updatedSource.includes('natsLiveMessage$')) {
    updatedSource = insertAtPosition(updatedSource, beforeEachStart, variablesToAdd);
  }
  
  const beforeEachBlockStart = updatedSource.indexOf('{', beforeEachStart) + 1;
  const initializationCode = `
    azureLoggedUser$ = new Subject<AppShellUser>();
    natsLiveMessage$ = new Subject<NatsMessage | null>();
    natsMessageCount$ = new Subject<number>();
    mockAzureService = jasmine.createSpyObj('AzureService', ['initialize', 'login', 'logout'], { loggedUser$: azureLoggedUser$.asObservable() });
    mockNatsService = jasmine.createSpyObj('NatsService', ['initialize', 'initializeUser', 'readMessages', 'isValidMessage'], { liveMessage$: natsLiveMessage$.asObservable(), unreadMessagesCount$: natsMessageCount$.asObservable() });
    mockToastService = jasmine.createSpyObj('AppShellToastService', ['showToast'], { toasts$: of([]) });`;
  
  // Check if initialization exists
  if (!updatedSource.includes('mockNatsService = jasmine.createSpyObj')) {
    updatedSource = updatedSource.replace(/mockAzureService = jasmine\.createSpyObj\(.*?;/, '');
    updatedSource = insertAtPosition(updatedSource, beforeEachBlockStart, initializationCode);
  }
  
  // Update TestBed configuration
  const testBedConfigStart = updatedSource.indexOf('TestBed.configureTestingModule', beforeEachBlockStart);
  const importsStart = updatedSource.indexOf('imports:', testBedConfigStart);
  const importsEnd = updatedSource.indexOf(']', importsStart);
  
  // Add MockAppShellToastsComponent to imports
  if (!updatedSource.substring(importsStart, importsEnd).includes('MockAppShellToastsComponent')) {
    const importsList = updatedSource.substring(importsStart, importsEnd);
    const lastImportPos = importsList.lastIndexOf(',') + 1;
    const newImportsSection = importsList.substring(0, lastImportPos) + ' AppShellToastsComponent,' + importsList.substring(lastImportPos);
    updatedSource = updatedSource.substring(0, importsStart) + newImportsSection + updatedSource.substring(importsEnd);
  }
  
  // Add providers for NatsService and AppShellToastService
  const providersStart = updatedSource.indexOf('providers:', testBedConfigStart);
  
  if (providersStart !== -1) {
    const providersEnd = updatedSource.indexOf(']', providersStart);
    const providersList = updatedSource.substring(providersStart, providersEnd);
    
    if (!providersList.includes('NatsService') || !providersList.includes('AppShellToastService')) {
      const lastProviderPos = providersList.lastIndexOf(',') + 1;
      let newProviders = '';
      
      if (!providersList.includes('NatsService')) {
        newProviders += '\n        { provide: NatsService, useValue: mockNatsService },';
      }
      
      if (!providersList.includes('AppShellToastService')) {
        newProviders += '\n        { provide: AppShellToastService, useValue: mockToastService },';
      }
      
      const newProvidersSection = providersList.substring(0, lastProviderPos) + newProviders + providersList.substring(lastProviderPos);
      updatedSource = updatedSource.substring(0, providersStart) + newProvidersSection + updatedSource.substring(providersEnd);
    }
  }
  
  const compileComponentsEnd = updatedSource.indexOf('.compileComponents()', testBedConfigStart);
  const beforeEachEnd = updatedSource.indexOf('});', compileComponentsEnd);
  
  if (!updatedSource.substring(compileComponentsEnd, beforeEachEnd).includes('whenStable')) {
    const whenStableCode = `\n    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();\n  `;
    updatedSource = insertAtPosition(updatedSource, beforeEachEnd, whenStableCode);
    
    updatedSource = updatedSource.replace(/beforeEach\(\(\) => \{[\s\S]*?fixture = TestBed\.createComponent\(AppComponent\);[\s\S]*?component = fixture\.componentInstance;[\s\S]*?fixture\.detectChanges\(\);[\s\S]*?\}\);/, '');
  }

  const describeEnd = updatedSource.lastIndexOf('});');
  const testsToAdd = `  it('should call initializeUser with a valid NATS user name', fakeAsync(() => {
    azureLoggedUser$.next({fullName: 'Fake', username: 'fake.user@fakemail.com'} as AppShellUser);
    natsMessageCount$.next(0);
    tick(5000);
    expect(mockNatsService.initializeUser).toHaveBeenCalledWith('fake_user');
    expect(mockToastService.showToast).not.toHaveBeenCalled();
  }));

  it('should show a toast with the initial notifications count', fakeAsync(() => {
    azureLoggedUser$.next({fullName: 'Fake', username: 'fake.user@fakemail.com'} as AppShellUser);
    natsMessageCount$.next(3);
    tick(5000);
    expect(mockNatsService.initializeUser).toHaveBeenCalledWith('fake_user');
    expect(mockToastService.showToast).toHaveBeenCalled();
  }));

  it('should manage properly the received message from nats service', fakeAsync(() => {
    mockToastService.showToast.calls.reset();
    natsLiveMessage$.next(null);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    natsLiveMessage$.next({data: null} as NatsMessage);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    mockNatsService.isValidMessage.and.returnValue(false);
    natsLiveMessage$.next({data: {}} as NatsMessage);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    mockNatsService.isValidMessage.and.throwError(new Error('Invalid message format'));
    natsLiveMessage$.next({data: {}} as NatsMessage);
    expect(mockToastService.showToast).not.toHaveBeenCalled();
    mockNatsService.isValidMessage.and.returnValue(true);
    natsLiveMessage$.next({data: {}} as NatsMessage);
    expect(mockToastService.showToast).toHaveBeenCalled();
  }));`;
  updatedSource = insertAtPosition(updatedSource, describeEnd, testsToAdd);
  
  // Write updated content
  tree.overwrite(testFilePath, updatedSource);
}

function updateImport(sourceFile: ts.SourceFile, filePath: string, importPath: string, importValues: string[]): Change {
  const importNode = findImportNode(sourceFile, importPath);
  
  if (!importNode) {
    return new NoopChange();
  }
  
  const importClause = importNode.importClause;
  if (!importClause || !importClause.namedBindings || !ts.isNamedImports(importClause.namedBindings)) {
    return new NoopChange();
  }
  
  const namedImports = importClause.namedBindings.elements.map(
    (element) => element.name.text
  );
  
  const missingImports = importValues.filter(
    (value) => !namedImports.includes(value)
  );
  
  if (missingImports.length === 0) {
    return new NoopChange();
  }
  
  const updatedImports = [...namedImports, ...missingImports].sort();
  const newImportClauseText = `{ ${updatedImports.join(', ')} }`;

  return new ReplaceChange(
    filePath,
    importNode.getStart(),
    importNode.getText(),
    `import ${newImportClauseText} from '${importPath}';`
  );
}

function addNatsServiceImport(
  sourceFile: ts.SourceFile,
  filePath: string,
): Change {
  const natsServiceImportNode = findImportNode(sourceFile, './services/nats.service');
  
  if (natsServiceImportNode) {
    return new NoopChange();
  }

  return new InsertChange(
    filePath,
    0,
    `import { NatsService } from './services/nats.service';\n`
  );
}

function updateComponentImports(
  sourceFile: ts.SourceFile,
  filePath: string,
  importValues: string[]
): Change {
  const componentDecorator = findComponentDecorator(sourceFile);
  
  if (!componentDecorator) {
    return new NoopChange();
  }
  
  const importsProperty = findPropertyInDecorator(componentDecorator, 'imports');
  
  if (!importsProperty || !importsProperty.initializer || !ts.isArrayLiteralExpression(importsProperty.initializer)) {
    return new NoopChange();
  }
  
  const currentImports = importsProperty.initializer.elements.map(
    (element) => element.getText()
  );
  
  const missingImports = importValues.filter(
    (value) => !currentImports.includes(value)
  );
  
  if (missingImports.length === 0) {
    return new NoopChange();
  }
  
  // Build new imports array text
  const updatedImports = [...currentImports, ...missingImports];
  const newImportsText = `[${updatedImports.join(', ')}]`;

  return new ReplaceChange(
    filePath,
    importsProperty.initializer.getStart(),
    importsProperty.initializer.getText(),
    newImportsText
  );
}

function addClassProperties(
  sourceFile: ts.SourceFile,
  filePath: string,
  properties: string[]
): Change {
  const classDeclaration = findClassDeclaration(sourceFile);
  
  if (!classDeclaration) {
    return new NoopChange();
  }
  
  // Find position to insert properties (after last property declaration)
  const members = classDeclaration.members;
  let insertPosition = members.length > 0 
    ? members[0].getStart()
    : classDeclaration.getStart() + classDeclaration.name!.getEnd() - classDeclaration.name!.getStart() + 1;
  
  const propertiesText = properties.map(prop => `  ${prop}\n`).join('');
  
  return new InsertChange(
    filePath,
    insertPosition,
    propertiesText
  );
}

function updateConstructor(
  sourceFile: ts.SourceFile,
  filePath: string,
  parameters: string[]
): Change {
  const classDeclaration = findClassDeclaration(sourceFile);
  
  if (!classDeclaration) {
    return new NoopChange();
  }
  
  const constructorMethod = classDeclaration.members.find(
    (member) => ts.isConstructorDeclaration(member)
  ) as ts.ConstructorDeclaration | undefined;
  
  if (!constructorMethod) {
    // Add new constructor
    const constructorText = `
  constructor(${parameters.join(', ')}) {
    this.headerPicker = {
      label: 'Catalogs',
      options: ['Option 1', 'Option 2', 'Option 3']
    };
  }
`;
    
    return new InsertChange(
      filePath,
      classDeclaration.members[0].getStart(),
      constructorText
    );
  }
  
  // Update existing constructor parameters
  const currentParameters = constructorMethod.parameters.map(
    (param) => param.getText()
  );
  
  const missingParameters = parameters.filter(
    (param) => !currentParameters.includes(param)
  );
  
  if (missingParameters.length === 0) {
    return new NoopChange();
  }
  
  // Build new parameters text
  const updatedParameters = [...currentParameters, ...missingParameters];
  const newParametersText = updatedParameters.join(', ');
  
  return new ReplaceChange(
    filePath,
    constructorMethod.parameters.pos,
    [...currentParameters].join(', '),
    newParametersText
  );
}

function updateNgOnInit(
  sourceFile: ts.SourceFile,
  filePath: string,
  methodContent: string
): Change {
  const classDeclaration = findClassDeclaration(sourceFile);
  
  if (!classDeclaration) {
    return new NoopChange();
  }
  
  const ngOnInitMethod = classDeclaration.members.find(
    (member) => 
      ts.isMethodDeclaration(member) && 
      member.name.getText() === 'ngOnInit'
  ) as ts.MethodDeclaration | undefined;
  
  if (!ngOnInitMethod) {
    // Add new ngOnInit method
    return new InsertChange(
      filePath,
      classDeclaration.members[0].getStart(),
      `\n  ${methodContent}\n`
    );
  }
  
  return new ReplaceChange(
    filePath,
    ngOnInitMethod.getStart(),
    ngOnInitMethod.getText(),
    methodContent
  );
}

function updateNgOnDestroy(
  sourceFile: ts.SourceFile,
  filePath: string,
  methodContent: string
): Change {
  const classDeclaration = findClassDeclaration(sourceFile);
  
  if (!classDeclaration) {
    return new NoopChange();
  }
  
  const ngOnDestroyMethod = classDeclaration.members.find(
    (member) => 
      ts.isMethodDeclaration(member) && 
      member.name.getText() === 'ngOnDestroy'
  ) as ts.MethodDeclaration | undefined;
  
  if (!ngOnDestroyMethod) {
    // Add new ngOnDestroy method
    return new InsertChange(
      filePath,
      classDeclaration.members[0].getStart(),
      `\n  ${methodContent}\n`
    );
  }
  
  return new ReplaceChange(
    filePath,
    ngOnDestroyMethod.getStart(),
    ngOnDestroyMethod.getText(),
    methodContent
  );
}

function addMethod(
  sourceFile: ts.SourceFile,
  filePath: string,
  methodContent: string
): Change {
  const classDeclaration = findClassDeclaration(sourceFile);
  
  if (!classDeclaration) {
    return new NoopChange();
  }
  
  // Add method at the end of the class
  const closeBracePosition = classDeclaration.getEnd() - 1;
  
  return new InsertChange(
    filePath,
    closeBracePosition,
    `\n  ${methodContent}\n`
  );
}

// Utility functions

function findImportNode(sourceFile: ts.SourceFile, moduleName: string): ts.ImportDeclaration | undefined {
  return sourceFile.statements.find(
    (statement) => 
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.getText().includes(moduleName)
  ) as ts.ImportDeclaration | undefined;
}

function getSourceNodes(sourceFile: ts.SourceFile): ts.Node[] {
  const nodes: ts.Node[] = [sourceFile];
  function visit(node: ts.Node) {
    nodes.push(node);
    ts.forEachChild(node, visit);
  }
  ts.forEachChild(sourceFile, visit);
  return nodes;
}

function findComponentDecorator(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  const nodes = getSourceNodes(sourceFile);
  
  const decorator = nodes.find(
    (node) => 
      ts.isDecorator(node) &&
      node.expression.getText().startsWith('Component')
  ) as ts.Decorator;
  
  if (!decorator || !ts.isCallExpression(decorator.expression)) {
    return undefined;
  }
  
  const argument = decorator.expression.arguments[0];
  if (!argument || !ts.isObjectLiteralExpression(argument)) {
    return undefined;
  }
  
  return argument;
}

function findPropertyInDecorator(
  decorator: ts.ObjectLiteralExpression,
  propertyName: string
): ts.PropertyAssignment | undefined {
  return decorator.properties.find(
    (property) => 
      ts.isPropertyAssignment(property) &&
      property.name.getText() === propertyName
  ) as ts.PropertyAssignment | undefined;
}

function findClassDeclaration(sourceFile: ts.SourceFile): ts.ClassDeclaration | undefined {
  return sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
  ) as ts.ClassDeclaration | undefined;
}

function insertAtPosition(source: string, position: number, content: string): string {
  return source.substring(0, position) + content + source.substring(position);
}
