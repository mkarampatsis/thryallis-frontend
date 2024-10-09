import { Injectable, inject, signal } from '@angular/core';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { IUser, IAuthResponse } from 'src/app/shared/interfaces/auth';
import { take } from 'rxjs';

const APIPREFIX = `${environment.apiUrl}/log`;

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    socialAuthService = inject(SocialAuthService);
    http = inject(HttpClient);
    router = inject(Router);

    user = signal(<IUser | null>null);

    constructor() {
        this.socialAuthService.authState.subscribe({
            next: (user) => {
                // console.log('GOOGLE AUTH STATE', user);
                if (user) {
                    const { idToken } = user;
                    this.http
                        .post<IAuthResponse>(`${environment.apiUrl}/auth/google-auth`, {
                            idToken,
                        })
                        .subscribe({
                            next: (res: IAuthResponse) => {
                                this.user.set(res.user);
                                localStorage.setItem('accessToken', res.accessToken);
                                this.router.navigate(['dashboard']);
                            },
                            error: (err) => {
                                console.log(err);
                            },
                        });
                }
            },
            error: (err) => {
                console.log('GOOGLE AUTH ERROR', err);
            },
        });
    }

    signOut() {
        this.socialAuthService.signOut();
        this.http.post(`${APIPREFIX}/logout`, this.userInfo()).pipe(take(1)).subscribe();
        this.user.set(null);
        localStorage.removeItem('accessToken');
        this.router.navigate(['/login']);
    }

    canEdit(code: string) {
        // Flatten the users roles array with respect to foreis and monades
        const roles = this.user()
            .roles.filter((type) => {
                return type.role === 'EDITOR' || type.role === 'ADMIN' || type.role === 'ROOT';
            })
            .filter((role) => {
                return role.foreas.includes(code) || role.monades.includes(code);
            });
        return roles.length > 0;
    }

    userInfo() {
        const email = this.user().email;
        return {
            user_id: email,
            email,
        };
    }
}
