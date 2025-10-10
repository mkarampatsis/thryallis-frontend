import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';
import { Oauth2Service } from '../../services/oauth2.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [NgIf, RouterLink, MatIconModule, NgbDropdownModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css',
})
export class UserInfoComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  user = this.authService.user;
  oauthService = inject(Oauth2Service);

  imgSrcError = false;

  logout() {
    // this.oauthService.gsisLogout();
    // this.authService.signOut();
    this.authService.removeUser();
  }

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  hasEditorRole() {
    console.log(this.userService.hasEditorRole())
    return this.userService.hasEditorRole();
  }

  hasAdminRole() {
    console.log(this.userService.hasAdminRole())
    return this.userService.hasAdminRole();
  }
}
