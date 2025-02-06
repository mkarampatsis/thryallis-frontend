import { Injectable,inject } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { CLIENT_PWD, CLIENT_ID } from '../config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGsisUser } from '../interfaces/auth/gsisUser.interface';
import { environment } from 'src/environments/environment';

const APIPREFIX = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {
//   private oAuthService = inject(OAuthService);
    http = inject(HttpClient)    

    constructor() {
        // this.initConfiguration();
    }

//   initConfiguration() {
//     const authConfig: AuthConfig = {
//         // issuer: 'https://test.gsis.gr/oauth2servergov',
//         clientId: CLIENT_ID,
//         dummyClientSecret: CLIENT_PWD,
//         redirectUri: 'https://ypes.ddns.net',
//         scope: 'openid profile email offline_access roles',

//         // URL of the login, logout, and silent refresh endpoints
//         loginUrl: 'https://test.gsis.gr/oauth2servergov/oauth/authorize',
//         logoutUrl: 'https://test.gsis.gr/oauth2servergov/logout',
//         tokenEndpoint: 'https://test.gsis.gr/oauth2servergov/oauth/token',
//         userinfoEndpoint: 'https://test.gsis.gr/oauth2servergov/userinfo?format=xml',

//         oidc: true,
//         responseType: 'code',
//         strictDiscoveryDocumentValidation: false,
//         showDebugInformation: true,  // Turn off debug mode,
//     };

    // this.oAuthService.configure(authConfig);
    // this.oAuthService.loadDiscoveryDocumentAndTryLogin();
//   }


//   login() {
//     this.oAuthService.initImplicitFlow();
//   }

//   logout() {
//     this.oAuthService.revokeTokenAndLogout();
//     this.oAuthService.logOut();
//   }

//   getProfile() {
//     return this.oAuthService.getIdentityClaims();
//   }

//   getToken() {
//     return this.oAuthService.getAccessToken();
//   }

    gsisLogin() {
        const clientId = 'T4KA2K27387';
        const redirectUri = encodeURIComponent('https://ypes.ddns.net');
        const authUrl = `https://test.gsis.gr/oauth2servergov/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=read`;

        window.location.href = authUrl;
    }
    
    getGsisUser(code:string): Observable<IGsisUser> {
        const url = `${APIPREFIX}/gsisUser/${code}`;
        return this.http.get<IGsisUser>(url);
    }
}
