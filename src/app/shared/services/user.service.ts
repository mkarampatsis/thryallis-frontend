import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

import { IUser } from '../interfaces/auth';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';

// Store
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { selectOrganizationByCode$ } from 'src/app/shared/state/organizations.state';

const APIPREFIX_USER = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  user = this.authService.user;

  store = inject(Store<AppState>);
  organization$ = selectOrganizationByCode$

  getAllUsers(): Observable<IUser[]> {
    const url = `${APIPREFIX_USER}/all`;
    return this.http.get<IUser[]>(url);
  }

  getMyOrganizations(): Observable<{ organizations: string[]; organizational_units: string[] }> {
    const url = `${APIPREFIX_USER}/myaccesses`;
    return this.http.get<{ organizations: string[]; organizational_units: string[] }>(url);
  }

  hasHelpDeskRole() {
    return this.user().roles.some((role) => role.role === 'HELPDESK');
  }

  hasEditorRole() {
    return this.user().roles.some((role) => role.role === 'EDITOR');
  }

  hasAdminRole() {
    return this.user().roles.some((role) => role.role === 'ADMIN');
  }

  getMyFacilites() {
    const foreis = this.user().roles.find(r => r.role === 'FACILITY_EDITOR')?.foreas ?? [];
    
    let organizations: IOrganizationList[] = [];

    for (let forea of foreis) {
      this.store
        .select(this.organization$(forea))
        .pipe(take(1))
        .subscribe((org) => {
          organizations = organizations.concat(...org);
        });
    }

    return organizations;
  }

  hasFacilityAdminRole() {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'FACILITY_ADMIN');
    }

    return false;
  }

  hasFacilityEditorRole() {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'FACILITY_EDITOR');
    }

    return false;
  }

  hasFacilityEditorRoleInOrganization(code:string) {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'FACILITY_EDITOR' && role.foreas.includes(code));
    }

    return false;
  }

  getMyEquipments() {
    const foreis = this.user().roles.find(r => r.role === 'EQUIPMENT_EDITOR')?.foreas ?? [];
    
    let organizations: IOrganizationList[] = [];

    for (let forea of foreis) {
      this.store
        .select(this.organization$(forea))
        .pipe(take(1))
        .subscribe((org) => {
          organizations = organizations.concat(...org);
        });
    }

    return organizations;
  }

  hasEquipmentAdminRole() {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'EQUIPMENT_ADMIN');
    }

    return false;
  }
  
  hasEquipmentEditorRole() {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'EQUIPMENT_EDITOR');
    }

    return false;
  }

  hasEquipmentEditorRoleInOrganization(code:string) {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'EQUIPMENT_EDITOR' && role.foreas.includes(code));
    }

    return false;
  }

  hasUserResourcesAdminRole() {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'USER_RESOURCES_ADMIN');
    }

    return false;
  }
  
  hasUserResourcesEditorRole() {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'USER_RESOURCES_EDITOR');
    }

    return false;
  }

  hasUserResourcesEditorRoleInOrganization(code:string) {
    if (this.user()) {
      return this.user().roles.some((role) => role.role === 'USER_RESOURCES_EDITOR' && role.foreas.includes(code));
    }

    return false;
  }

  getMyUserResources() {
    const foreis = this.user().roles.find(r => r.role === 'USER_RESOURCES_EDITOR')?.foreas ?? [];
    
    let organizations: IOrganizationList[] = [];

    for (let forea of foreis) {
      this.store
        .select(this.organization$(forea))
        .pipe(take(1))
        .subscribe((org) => {
          organizations = organizations.concat(...org);
        });
    }

    return organizations;
  }


  setUserAccesses(email: string, organizationCodes: string[], organizationalUnitCodes: string[]): Observable<{ msg: string }> {
    const url = `${APIPREFIX_USER}/${email}`;
    return this.http.put<{ msg: string }>(url, { email, organizationCodes, organizationalUnitCodes });
  }
}
