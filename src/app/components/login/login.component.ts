import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { Oauth2Service } from 'src/app/shared/services/oauth2.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

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
  authService = inject(AuthService);
  route = inject(ActivatedRoute)
  
  user = this.authService.user;

  loading = this.authService.loading;

  // constructor() {
  //   effect(
  //     () => {
  //       if (this.user()){
  //         // this.loading.set(false);
  //       }
  //     },
  //   );
  // }
  
  login() {
    this.oauth2Service.gsisLogin();
  }

  logout() {
    this.oauth2Service.gsisLogout();
  }
}
