import { ApplicationConfig, LOCALE_ID, isDevMode } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEl from '@angular/common/locales/el';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleClientId } from './shared/config';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptorService } from './shared/services/auth-interceptor.service';
import { BackendInterceptor } from './shared/services/backend-interceptor.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { getOrganizationsEffect, organizationReducer } from './shared/state/organizations.state';
import { getOrganizationalUnitsEffect, organizationalUnitsReducer } from './shared/state/organizational-units.state';
import { loadRemitsEffect, remitsReducer } from './shared/state/remits.state';
import { provideOAuthClient } from 'angular-oauth2-oidc';

registerLocaleData(localeEl, 'el-GR');

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: LOCALE_ID, useValue: 'el-GR' },
        provideRouter(routes),
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(GoogleClientId),
                    },
                ],
                onError: (err: any) => {
                    console.log(err);
                },
            } as SocialAuthServiceConfig,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true,
        },
        { provide: HTTP_INTERCEPTORS, useClass: BackendInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        provideStore({
            organizations: organizationReducer,
            organizationalUnits: organizationalUnitsReducer,
            remits: remitsReducer,
        }),
        provideEffects([{ getOrganizationsEffect, getOrganizationalUnitsEffect, loadRemitsEffect }]),
        provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
        provideOAuthClient()
    ],
};
