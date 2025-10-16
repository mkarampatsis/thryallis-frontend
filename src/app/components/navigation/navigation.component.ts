import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserInfoComponent } from '../../shared/components/user-info/user-info.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from 'src/app/shared/services/user.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule,RouterLink, RouterLinkActive, UserInfoComponent, MatIconModule, NgIf],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})

export class NavigationComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  user = this.authService.user;
  store = inject(Store<AppState>);

  organizationsLoading$ = this.store.select((state) => state.organizations.loading);
  organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);
  remitsLoading$ = this.store.select((state) => state.remits.loading);
  
  synchronization = this.authService.synchronization;

  hasEditorRole() {
    return this.userService.hasEditorRole();
  }

  hasFacilityAdminRole() {
    return this.userService.hasFacilityAdminRole()
  }

  hasFacilityEditorRole() {
    return this.userService.hasFacilityEditorRole()
  }

  hasEquipmentAdminRole() {
    return this.userService.hasEquipmentAdminRole()
  }

  hasEquipmentEditorRole() {
    return this.userService.hasEquipmentEditorRole()
  }

  hasUserResourcesAdminRole() {
    return this.userService.hasUserResourcesAdminRole()
  }

  hasUserResourcesEditorRole() {
    return this.userService.hasUserResourcesEditorRole()
  }
}
