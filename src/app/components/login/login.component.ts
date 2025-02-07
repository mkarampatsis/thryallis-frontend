import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { Oauth2Service } from 'src/app/shared/services/oauth2.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, GoogleSigninButtonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
    store = inject(Store<AppState>);
    oauthService = inject(Oauth2Service);
    route = inject(ActivatedRoute)

    organizationsLoading$ = this.store.select((state) => state.organizations.loading);
    organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
    remitsLoading$ = this.store.select((state) => state.remits.loading);

    loading$ = this.organizationsLoading$ || this.organizationalUnitsLoading$;

    user: any = '';


    ngOnInit() {
        this.route.queryParams.subscribe(params => {
          const authCode = params['code'];
          if (authCode) {
            console.log(authCode)
            this.oauthService.getGsisUser(authCode)
            .subscribe(data => {
                console.log("gsisUser>>", data)
                this.user = data['user']
            })
            // this.exchangeCodeForToken(authCode);
          }
        });
      }

    login() {
        // this.authService.login();
        // this.authService.getGsisUser()
        //     .subscribe(data=>{
        //         console.log("GSIS",data);
        //     })
        this.oauthService.gsisLogin();
    }

    logout() {
        // this.authService.logout();
        // this.router.navigate([`https://test.gsis.gr/oauth2server/logout/${{CLIENT_ID}}/?url=https://localhost:4200/`]);
    }

    // get profile() {
    //     let profile:any = this.authService.getProfile(); 
    //     return profile ? profile: null;
    // }
}
