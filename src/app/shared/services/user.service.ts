import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IUser } from '../interfaces/auth';

const APIPREFIX_USER = `${environment.apiUrl}/user`;

@Injectable({
    providedIn: 'root',
})
export class UserService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    user = this.authService.user;

    getAllUsers(): Observable<IUser[]> {
        const url = `${APIPREFIX_USER}/all`;
        return this.http.get<IUser[]>(url);
    }

    getMyOrganizations(): Observable<{ organizations: string[]; organizational_units: string[] }> {
        const url = `${APIPREFIX_USER}/myaccesses`;
        return this.http.get<{ organizations: string[]; organizational_units: string[] }>(url);
    }

    hasHelpDeskRole() {
        return this.user().roles.some((role) => role.role === 'HELPDESK');
    }

    setUserAccesses(email:string, organizationCodes:string[], organizationalUnitCodes:string[]) : Observable<{ msg: string }> {
        console.log('User Service:', email, organizationCodes, organizationalUnitCodes);
        const url = `${APIPREFIX_USER}/${email}`;
        console.log(url)
        return this.http.put<{ msg: string }>(url, { email, organizationCodes, organizationalUnitCodes });
    }
}
