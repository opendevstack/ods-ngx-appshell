# NgxAppShell

A comprehensive Angular library providing pre-built UI components, directives, and schematics for building modern enterprise applications with Material Design.

**Version:** 19.0.5
**Angular:** >=19.0.0

## Features

- 🎨 Pre-built components based on Material Design
- 🔧 Reusable directives for common patterns
- 🚀 Schematics for quick integration of authentication and notifications
- 📦 Dependencies: Angular Material, Azure MSAL, NATS.io, and ngx-markdown
- 🎯 Designed for enterprise applications

## Installation

```bash
ng add @appshell/ngx-appshell
```

Or install manually:

```bash
npm install @appshell/ngx-appshell
```

Take into account that the ng add command, prepares the project to work with the library, if you use npm install, you'll need to reproduce manually the steps from the ng-add schematics in your project.

## Components

The library provides the following components:

### Layout Components
- **appshell-layout** - Main application layout container
- **appshell-platform-layout** - Platform-specific layout wrapper
- **appshell-header** - Application header component
- **appshell-platform-header** - Platform-specific header
- **appshell-page-header** - Page-level header component
- **appshell-sidebar-menu** - Sidebar navigation menu

### Navigation Components
- **appshell-breadcrumb** - Breadcrumb navigation component

### UI Components
- **appshell-chip** - Material chip component wrapper
- **appshell-icon** - Icon display component
- **appshell-filters** - Filtering UI component
- **appshell-select** - Enhanced select dropdown
- **appshell-toast** - Toast notification component
- **appshell-toasts** - Toast notification container

### Product Components
- **appshell-product-card** - Product display card
- **appshell-product-card-v2** - Different product card (v2)

## Directives

- **appshell-link** - Enhanced link directive for navigation

## Schematics

The library includes the following schematics to quickly integrate common features:

### ng-add
```bash
ng add @appshell/ngx-appshell
```
Adds the AppShell module to your project with all necessary dependencies and configuration.

### azure-login
```bash
ng generate @appshell/ngx-appshell:azure-login
```
Integrates Azure Enterprise Login (MSAL) into your application. This schematic generates:
- Azure configuration files
- Azure authentication service
- App configuration service
- Required setup for MSAL authentication

### nats-notifications
```bash
ng generate @appshell/ngx-appshell:nats-notifications
```
Integrates NATS.io-based notifications into your application. This schematic generates:
- NATS service for message handling
- Notifications screen component
- Required setup for real-time notifications

## Dependencies

This library requires the following peer dependencies:

- `@angular/common` >= 19.0.0
- `@angular/core` >= 19.0.0
- `@angular/material` >= 19.0.0
- `@angular/animations` >= 19.0.0

Additional included dependencies:

- `@azure/msal-angular` - Azure authentication
- `@azure/msal-browser` - Azure MSAL browser support
- `@nats-io/nats-core` - NATS.io core functionality
- `@nats-io/jetstream` - NATS.io JetStream
- `@nats-io/kv` - NATS.io Key-Value store
- `marked` - Markdown parser
- `ngx-markdown` - Angular markdown component

## Development

### Code scaffolding

Run `ng generate component component-name --project ngx-appshell` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-appshell`.

> Note: Don't forget to add `--project ngx-appshell` or else it will be added to the default project in your `angular.json` file.

### Build

Run `ng build ngx-appshell` to build the project. The build artifacts will be stored in the `dist/` directory.

### Publishing

After building your library with `ng build ngx-appshell`, go to the dist folder `cd dist/ngx-appshell` and run `npm publish`.

### Running unit tests

Run `ng test ngx-appshell` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
