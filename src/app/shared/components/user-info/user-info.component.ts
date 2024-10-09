import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';

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

    imgSrcError = false;

    logout() {
        this.authService.signOut();
    }

    hasHelpDeskRole() {
        return this.userService.hasHelpDeskRole();
    }
}
