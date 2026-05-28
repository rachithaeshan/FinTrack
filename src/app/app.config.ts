import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};