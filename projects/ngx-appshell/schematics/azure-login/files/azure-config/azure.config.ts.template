import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { AppConfigService } from './services/app-config.service';

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(config: AppConfigService): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: config.getConfig()?.msalConfig?.auth?.clientId,
      authority: config.getConfig()?.msalConfig?.auth?.authority,
      redirectUri: '/'
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      allowNativeBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function MSALInterceptorConfigFactory(config: AppConfigService): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, string[]>();
  protectedResourceMap.set(
    config.getConfig()?.apiConfig?.uri,
    config.getConfig()?.apiConfig?.scopes
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(config: AppConfigService): MsalGuardConfiguration {;
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...config.getConfig()?.apiConfig?.scopes || []],
    },
    loginFailedRoute: '/login-failed',
  };
}

export const msalProviders = [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
      deps: [AppConfigService]
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
      deps: [AppConfigService]
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
      deps: [AppConfigService]
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
];