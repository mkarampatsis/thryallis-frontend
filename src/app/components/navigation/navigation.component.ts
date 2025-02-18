import { Component, inject, effect } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserInfoComponent } from '../../shared/components/user-info/user-info.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, UserInfoComponent, MatIconModule],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.css',
})

export class NavigationComponent {
    authService = inject(AuthService);
    userService = inject(UserService);
    user = this.authService.user;
    loading = this.authService.loading;
    synchronization = this.authService.synchronization

    hasEditorRole() {
        return this.userService.hasEditorRole();
    }
}
