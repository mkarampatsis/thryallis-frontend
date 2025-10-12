import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IAuthResponse, IUser } from '../interfaces/auth';
import { Router } from '@angular/router';
import { GSISCLIENTID } from '../config';

const APIPREFIX = `${environment.apiUrl}/auth`;
const APILOGOUT = `${environment.logoutUrl}`;
const REDIRECTURI = `${environment.redirectUri}`;

@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {
  http = inject(HttpClient)
  router = inject(Router);

  gsisLogin() {
    const redirectUri = encodeURIComponent(REDIRECTURI);
    const authUrl = `https://oauth2.gsis.gr/oauth2servergov/oauth/authorize?response_type=code&client_id=${GSISCLIENTID}&redirect_uri=${redirectUri}&scope=read`;
    window.location.href = authUrl;
  }

  getGsisUser(code: string): Observable<HttpResponse<IAuthResponse>> {
    const url = `${APIPREFIX}/gsisUser/${code}`;
    return this.http.get<IAuthResponse>(url, { observe: 'response' });
  }

   gsisLogout() {
    window.location.href = `${APILOGOUT}/${GSISCLIENTID}/?url=${REDIRECTURI}`;
  }
}
