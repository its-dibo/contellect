import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { ApiInterceptor } from '../interceptors/api.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { UniversalInterceptor } from '#interceptors/universal.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideClientHydration(),
    provideHttpClient(
      // enable fetch API for ssr
      withFetch(),
      // register interceptors
      withInterceptors([ApiInterceptor, UniversalInterceptor]),
    ),
    importProvidersFrom(BrowserAnimationsModule),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAnimations(),
  ],
};
