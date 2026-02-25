import { enableProdMode, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';

// 🔐 Keycloak imports
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './app/app.init'; // ✅ Import de votre fichier

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      KeycloakAngularModule
    ),
    provideRouter(routes),
    provideHttpClient(),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,  // ✅ Utilise votre fonction
      multi: true,
      deps: [KeycloakService]
    }
  ]
}).catch((err) => console.error(err));