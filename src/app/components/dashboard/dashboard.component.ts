import { Component, OnInit, inject } from '@angular/core';
import { take } from 'rxjs';
import { IOrganization } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnit } from 'src/app/shared/interfaces/organization-unit';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';

import { UserService } from 'src/app/shared/services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatIconModule, NgbTooltipModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
    userService = inject(UserService);
    constService = inject(ConstService);
    modalService = inject(ModalService);
    organizationService = inject(OrganizationService);
    organizationUnitsService = inject(OrganizationalUnitService);

    store = inject(Store<AppState>);

    organizationsLoading$ = this.store.select((state) => state.organizations.loading);
    organizationalUnitsLoading$ = this.store.select((state) => state.organizationalUnits.loading);

    organizations: IOrganization[] = [];
    organizations_loading = false;
    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;

    organizational_units: IOrganizationUnit[] = [];
    organizational_units_loading = false;
    organizationalUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;

    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    ngOnInit() {
        this.userService.getMyOrganizations().subscribe((data) => {
            if (data.organizations.length === 0) {
                this.organizations_loading = false;
            } else {
                data.organizations.forEach((org) => {
                    this.getOrganizationDetails(org);
                });
            }
            if (data.organizational_units.length === 0) {
                this.organizational_units_loading = false;
            } else {
                data.organizational_units.forEach((ou) => {
                    this.getOrganizationalUnitDetails(ou);
                });
            }
        });
    }

    creationRegulation() {
        alert('Δεν είναι υλοποιημένο ακόμη!');
    }

    editForeas(code: string) {
        this.modalService.foreasEdit(code);
    }

    editMonada(code: string) {
        console.log('editMonada >>>>>>>>>>>>>>>>', code);
        this.modalService.monadaEdit(code);
    }

    newRemit(organizationalUnit: IOrganizationUnit) {
        this.modalService.newRemit({
            code: organizationalUnit.code,
            preferredLabel: organizationalUnit.preferredLabel,
        });
    }

    getOrganizationDetails(code: string) {
        this.organizations_loading = true;
        return this.organizationService
            .getOrganizationDetails(code)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizations.push(data);
                this.organizations_loading = false;
            });
    }

    getOrganizationalUnitDetails(code: string) {
        this.organizational_units_loading = true;
        return this.organizationUnitsService
            .getOrganizationalUnitDetails(code)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizational_units.push(data);
                this.organizational_units_loading = false;
            });
    }

    showOrganizationDetails(code: string): void {
        this.modalService.showOrganizationDetails(code);
    }

    showOrganizationalUnitDetails(code: string): void {
        this.modalService.showOrganizationUnitDetails(code);
    }
}
