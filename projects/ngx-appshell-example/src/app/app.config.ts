import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { AppConfigService } from './services/app-config.service';
import { msalProviders } from './azure.config';
import { IconRegistryService } from 'ngx-appshell';
import { provideAppInitializer } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideMarkdown(),
    provideAppInitializer(() => {
      const appConfigService = inject(AppConfigService);
      const iconService = inject(IconRegistryService);
      return appConfigService.loadConfig().then(() => 
        iconService.registerIconsFromManifest('assets/icons.json')
      );
    }),
    ...msalProviders,
  ],
};
