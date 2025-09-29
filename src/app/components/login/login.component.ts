import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { Oauth2Service } from 'src/app/shared/services/oauth2.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  store = inject(Store<AppState>);
  oauth2Service = inject(Oauth2Service);
  route = inject(ActivatedRoute)

  // organizationsLoading$ = this.store.select((state) => state.organizations.loading);
  // organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
  // remitsLoading$ = this.store.select((state) => state.remits.loading);

  // loading$ = this.organizationsLoading$ || this.organizationalUnitsLoading$;
  loading = false;

  user: any = '';

  login() {
    this.oauth2Service.gsisLogin();
    this.loading = true;
    // this.oauth2Service.getGsisUser("NYoGzL")
    // .subscribe(data => {
    //   console.log(data)
    //   // this.router.navigate(['landing']);
    //   // this.user = data['user']
    // })
  }

  // horizontalGSIS() {
  //   this.oauth2Service.getGsisHorizontal()
  //     .subscribe(data => {
  //       console.log(data);
  //     })
  // }

  logout() {
    this.oauth2Service.gsisLogout();
    // this.router.navigate([`https://test.gsis.gr/oauth2server/logout/${{CLIENT_ID}}/?url=https://localhost:4200/`]);
  }
}
