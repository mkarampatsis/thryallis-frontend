import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { Oauth2Service } from 'src/app/shared/services/oauth2.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, GoogleSigninButtonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    store = inject(Store<AppState>);
    private authService = inject(Oauth2Service);

    organizationsLoading$ = this.store.select((state) => state.organizations.loading);
    organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
    remitsLoading$ = this.store.select((state) => state.remits.loading);

    loading$ = this.organizationsLoading$ || this.organizationalUnitsLoading$;

    login() {
        this.authService.login();
    }

    logout() {
        this.authService.logout();
        // this.router.navigate([`https://test.gsis.gr/oauth2server/logout/${{CLIENT_ID}}/?url=https://localhost:4200/`]);
    }

    get profile() {
        let profile:any = this.authService.getProfile(); 
        return profile ? profile: null;
    }
}
