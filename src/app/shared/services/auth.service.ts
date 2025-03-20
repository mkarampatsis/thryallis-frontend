import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { IUser, IAuthResponse } from 'src/app/shared/interfaces/auth';
import { take } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { toSignal } from '@angular/core/rxjs-interop';

const APIPREFIX = `${environment.apiUrl}/log`;

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    socialAuthService = inject(SocialAuthService);
    store = inject(Store<AppState>);
    http = inject(HttpClient);
    router = inject(Router);

    user = signal(<IUser | null>null);
    synchronization = signal<boolean>(false);
    loading = signal<boolean>(false);

    organizationsLoading$ = this.store.select((state) => state.organizations.loading);
    organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
    remitsLoading$ = this.store.select((state) => state.remits.loading);

    organization = toSignal(this.organizationsLoading$,{ initialValue: false })
    organizationalUnits = toSignal(this.organizationalUnitsLoading$,{ initialValue: false })
    remits = toSignal(this.remitsLoading$,{ initialValue: false })

    loading$ = computed(() => 
        this.organization() || this.organizationalUnits() || this.remits()
    );

    constructor() {
        effect(
            () => {
              if (!this.loading$()) {
                console.log("synchronization 1>>>")
                this.synchronization.set(true);
              } else {
                  console.log("synchronization 2>>>")
                  this.router.navigate(['landing']);
              }
            },
            { allowSignalWrites: true }
        );
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
                                // this.router.navigate(['dashboard']);
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

    checkDataLoading() {
        const organizationsLoading$ = this.store.select((state) => state.organizations.loading);
        const organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
        const remitsLoading$ = this.store.select((state) => state.remits.loading);

        const organization = toSignal(organizationsLoading$,{ initialValue: false })
        const organizationalUnits = toSignal(organizationalUnitsLoading$,{ initialValue: false })
        const remits = toSignal(remitsLoading$,{ initialValue: false })

        // const loading$ = computed(() => 
        //     organization() || organizationalUnits() || remits()
        // );
        this.loading.set(organization() || organizationalUnits() || remits())
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
