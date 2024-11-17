import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
import { IUser } from 'src/app/shared/interfaces/auth';
import { UserService } from 'src/app/shared/services/user.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { AppState } from 'src/app/shared/state/app.state';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { Store } from '@ngrx/store';
import { ConstService } from 'src/app/shared/services/const.service';
import { Observable, take } from 'rxjs'

interface IResult {
    status: string;
    subOrganizationOf: string;
    code: string;
    organizationType: number | string;
    preferredLabel: string;
    users: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LogDataService {
    organizationService = inject(OrganizationService);
    userService = inject(UserService);
    constService = inject(ConstService);

    store = inject(Store<AppState>);
    organizations$ = selectOrganizations$;
    
    foreis: IOrganizationList[] = [];
    result: IResult[] = []
        
    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    createOrganizationGrid(){
        this.store
        .select(selectOrganizations$)
        .pipe(take(1))
        .subscribe((data) => {
            this.foreis = data.map((org) => {
                return {
                    ...org,
                    organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
                    subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
                };
            });
            this.userService.getAllUsers().subscribe((users) => {
                // console.log("foreis",this.foreis)
                this.result = this.foreis.map((organization) => {
                    // Find users with the editor role that match the organization's code in foreas
                    const usersForOrg = users
                      .filter((user) =>
                        user.roles.some(
                          (role) =>
                            role.role === "EDITOR" && role.foreas.includes(organization.code)
                        )
                      )
                      .map((user) => user.email); // Extract email of matched users
                  
                    return {
                      status: organization.status,
                      subOrganizationOf: organization.subOrganizationOf,
                      code: organization.code,
                      organizationType: organization.organizationType,
                      preferredLabel: organization.preferredLabel,
                      users: usersForOrg,
                    };
                });
            });
        });
        console.log(this.result)
        return (this.result)
    }
}
