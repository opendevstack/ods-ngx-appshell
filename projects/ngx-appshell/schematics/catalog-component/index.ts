import { apply, applyTemplates, chain, externalSchematic, MergeStrategy, mergeWith, move, Rule, Tree, url } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { CatalogComponentSchema } from './catalog-component';

function addRouteToAppRoutes(tree: Tree, options: CatalogComponentSchema, componentName: string, routePath: string, importPath: string): void {
    const appRoutesPath = `${options.path}/app.routes.ts`;
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

export function catalogComponentGenerator(options: CatalogComponentSchema): Rule {
    return () => {
        console.log(`Generating a component named product-catalog-screen at path ${options.path}`);

        const catalogTemplateSource = apply(
            url('./files/product-catalog-screen'),
            [
                applyTemplates({}),
                move(normalize(`/${options.path}/screens/product-catalog-screen`))
            ]
        )

        const productTemplateSource = apply(
            url('./files/product-view-screen'),
            [
                applyTemplates({}),
                move(normalize(`/${options.path}/screens/product-view-screen`))
            ]
        )

        const serviceTemplateSource = apply(
            url('./files/catalog-service'),
            [
                applyTemplates({}),
                move(normalize(`/${options.path}/services`))
            ]
        )
        
        return chain([
            externalSchematic('@schematics/angular', 'component', {name: 'product-catalog-screen', path: `${options.path}/screens`, style: 'scss'}),
            mergeWith(catalogTemplateSource, MergeStrategy.Overwrite),
            externalSchematic('@schematics/angular', 'component', {name: 'product-view-screen', path: `${options.path}/screens`, style: 'scss'}),
            mergeWith(productTemplateSource, MergeStrategy.Overwrite),
            externalSchematic('@schematics/angular', 'service', {name: 'catalog', path: `${options.path}/services`}),
            mergeWith(serviceTemplateSource, MergeStrategy.Overwrite),
            (tree: Tree) => {
                addRouteToAppRoutes(tree, options, 'ProductCatalogScreenComponent', '', './screens/product-catalog-screen/product-catalog-screen.component');
                addRouteToAppRoutes(tree, options, 'ProductViewScreenComponent', 'item/:id', './screens/product-view-screen/product-view-screen.component');
                addMarkdownProviderToAppConfig(tree);
                return tree;
            }
        ])
    }
}