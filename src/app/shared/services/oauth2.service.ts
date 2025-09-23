import { Injectable, inject, signal } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { CLIENT_PWD, CLIENT_ID } from '../config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGsisUser } from '../interfaces/auth/gsisUser.interface';
import { environment } from 'src/environments/environment';
import { IUser } from '../interfaces/auth';
import { Router } from '@angular/router';

const APIPREFIX = `${environment.apiUrl}/auth`;
const APILOGOUT = `${environment.logoutUrl}`;
const GSISCLIENTID = `${environment.gsisClientId}`;
const REDIRECTURI = `${environment.redirectUri}`;

@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {
  //   private oAuthService = inject(OAuthService);
  http = inject(HttpClient)
  user = signal(<IUser | null>null);
  router = inject(Router);

  gsisLogin() {
    // const clientId = 'T4KA2K27387';
    // const redirectUri = encodeURIComponent('https://ypes.ddns.net/login');
    // const authUrl = `https://test.gsis.gr/oauth2servergov/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=read`;
    
    const redirectUri = encodeURIComponent(REDIRECTURI);
    const authUrl = `https://oauth2.gsis.gr/oauth2servergov/oauth/authorize?response_type=code&client_id=${GSISCLIENTID}&redirect_uri=${redirectUri}&scope=read`;
    console.log(authUrl);
    window.location.href = authUrl;
  }

  getGsisUser(code: string): Observable<IGsisUser> {
    const url = `${APIPREFIX}/gsisUser/${code}`;
    return this.http.get<IGsisUser>(url);
  }

  getGsisHorizontal(): Observable<any> {
    const url = `${APIPREFIX}/gsisHorizontal`;
    return this.http.get<any>(url);
  }

  gsisLogout() {
    window.location.href = `${APILOGOUT}/${GSISCLIENTID}/?url=${REDIRECTURI}`;

    this.user.set(null);
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}
