# NgxAppShell

A comprehensive Angular UI component library that provides a complete application shell framework with pre-built components, layouts, and utilities for building enterprise applications.

## What is this project?

NgxAppShell is an Angular library that delivers a ready-to-use application shell with:
- Pre-built UI components (headers, layouts, breadcrumbs, chips, filters, icons, cards, etc.)
- Platform-level layouts and navigation structures
- Reusable directives and services
- Azure authentication integration support
- NATS notifications system support
- Consistent styling and theming capabilities

The library is designed to accelerate development by providing standardized, tested components that follow best practices and maintain visual consistency across applications.

## Project Structure

This monorepo contains two main projects:

### 1. **ngx-appshell** (Library Package)
Located in `projects/ngx-appshell/`, this is the core library that gets packaged and distributed as an npm package.

**Key directories:**
- `src/lib/components/` - Reusable UI components
- `src/lib/directives/` - Custom Angular directives
- `src/lib/models/` - TypeScript interfaces and models
- `src/lib/screens/` - Reusable UI screens
- `src/lib/services/` - Shared services
- `src/lib/styles/` - Component styles and themes
- `schematics/` - Angular schematics for easy setup:
  - `ng-add` - Initial library installation
  - `azure-login` - Azure authentication setup
  - `nats-notifications` - NATS notifications setup

### 2. **ngx-appshell-example** (Development/Testing Application)
Located in `projects/ngx-appshell-example/`, this is a full Angular application used for testing and developing the library components in a real application context.

**Key directories:**
- `src/app/` - Example application implementation
- `public/assets/` - Icons and static assets
- `public/config/` - Application configuration
- `public/fonts/` - Custom font files

## How to Work on This Project

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

```bash
# Install dependencies
npm install
```

### Development Workflow

#### 1. Start Developing

```bash
# Run the example application
npm run start:example

# Navigate to http://localhost:4200/
```

The example application automatically uses the local version of the library, allowing you to develop and test changes in real-time without needing to build the library separately.

#### 2. Running Tests

```bash
# Test the library
npm test
# or
ng test ngx-appshell

# Test the example application
ng test ngx-appshell-example
```

### Building the library

```bash
# Build the library for distribution
npm run build-lib

# The build artifacts will be in dist/ngx-appshell/
```

### Publishing the Library

To publish the library to npm:

```bash
# Install dependencies
npm install

# Pack the library
npm run pack-lib

# Navigate to the distribution folder
cd dist/ngx-appshell

# Login to npm (follow the login process)
npm login

# Publish the package
npm publish --access public
```

**Note:** Make sure you have the necessary permissions to publish to the npm registry and that you've updated the version number in `projects/ngx-appshell/package.json` before publishing.

## Customizing Your Brand

You can customize the appshell to match your brand identity by updating the following files in the example project:

### 1. Icons
- **`public/assets/icons.json`** - Define your icon mappings and references
- **`public/assets/icons/`** - Place your custom SVG icons here

### 2. Fonts
- **`public/fonts/`** - Add your custom font files (woff, woff2, ttf, etc.)
- **`src/_fonts.scss`** - Define your @font-face declarations and font variables. It is required to use 'AppShellTextFont' and 'AppShellHeadingFont' as font family since the application uses that reference.

Example font configuration:
```scss
@font-face {
  font-family: 'YourCustomFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

### 3. Additional Styling
- **`src/styles.scss`** - Global styles and theme overrides
- Customize CSS variables, colors, and component styles to match your brand

## Using Schematics

The library provides Angular schematics to quickly add functionality:

```bash
# Add the library to your project
ng add ngx-appshell

# Add Azure authentication support
ng generate ngx-appshell:azure-login

# Add NATS notifications support
ng generate ngx-appshell:nats-notifications
```

## Further Help

- Angular CLI: `ng help` or [Angular CLI Documentation](https://angular.dev/tools/cli)
- For component documentation, refer to the example application at `projects/ngx-appshell-example/`
