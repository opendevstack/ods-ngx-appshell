# NgxAppshell

This repository contains the angular version of the AppShell. A library meant to boost the development of applications.

> ⚠️ **_WARNING:_**  The current version of the library is still a WIP, there are things pending to be improved before making it public.

## Running the Example application

If you want to see the library components in action, you can use the ngx-appshell-example project to view the actual ngx-appshell components in action.
As it is now, you must change the `projects/ngx-appshell-example/public/config/config.json` file to use a valid Azure application for the login to work.

Once adapted that file, you can run `npm run start:example` and you will have an application that uses the AppShell running in `http://localhost:4200/`.

## Available schematics

The ngx-appshell project contains different foundational components (inputs, buttons, ...) that are following the Boehringer Ingelheim's design system. In addition there are also "high-value components" that are composed by different visual components including some logic (such as using the company azure SSO). In order to get these high value components, the library offers schematics that when users install the library can run in their projects to set up the functionalities.

Current schematics:
- Azure SSO: By running `ng generate @appshell/ngx-appshell:azure-login` you will have created the basic structure to have the login integrated into an application. 
- Component Catalog: By running `ng generate @appshell/ngx-appshell:catalog-component` you will have created a basic flow with screens to create a catalog of items.  

> ⚠️ **_NOTE:_**  The current version of the schematics is an initial version that only works with a specific setup (some existing methods, etc) that the fe-angular-appshell quickstarter offers. In further versions they will be improved to be idempotent and able to be run in any project setup.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
