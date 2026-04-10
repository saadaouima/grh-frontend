(window as any).global = window;

import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { environment } from './environments/environment';

import {
  provideKeycloak,
  includeBearerTokenInterceptor,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition
} from 'keycloak-angular';

import { enableMocking } from './app/mocks/browser';

if (environment.production) enableProdMode();

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^https?:\/\/localhost:8085(\/.*)?$/i // ✅ match http or https
});

async function main() {
  if (!environment.production) {
    await enableMocking(); // ✅ start MSW in dev
  }

  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),

      provideHttpClient(
        withInterceptors([includeBearerTokenInterceptor])
      ),

      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [urlCondition]
      },

      provideKeycloak({
        config: {
          url: environment.keycloak.url,
          realm: environment.keycloak.realm,
          clientId: environment.keycloak.clientId
        },
        initOptions: {
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          flow: 'standard',
          redirectUri: window.location.origin // ✅ safer without trailing slash
        }
      })
    ]
  }).catch(err => console.error(err));
}

main();