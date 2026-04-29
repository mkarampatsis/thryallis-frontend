import { Component, inject } from '@angular/core';
import { IUser } from '../../interfaces/auth';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, FirstDataRenderedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AppState } from '../../state/app.state';
import { selectOrganizations$ } from '../../state/organizations.state';
import { ConstService } from '../../services/const.service';
import { GridLoadingOverlayComponent } from '../grid-loading-overlay/grid-loading-overlay.component';
import { take } from 'rxjs';
import { IOrganizationList } from '../../interfaces/organization/organization-list.interface';
import { IForeas } from '../../interfaces/foreas/foreas.interface';
import { selectOrganizationalUnitCodeByOrganizationCode$} from 'src/app/shared/state/organizational-units.state';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-user-accesses',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './user-accesses.component.html',
    styleUrl: './user-accesses.component.css',
})
export class UserAccessesComponent {
    constService = inject(ConstService);
    userService = inject(UserService)
    modalRef: any;
    user: IUser;
    userForeis: string[] = [];
    foreis: IOrganizationList[] = [];

    store = inject(Store<AppState>);
    organizations$ = selectOrganizations$;
    selectOrganizationalUnitCodeByOrganizationCode$ = selectOrganizationalUnitCodeByOrganizationCode$

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
    autoSizeStrategy = this.constService.autoSizeStrategy;

    selectedData: IForeas[] = [];

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

    gridApi: GridApi<IOrganizationList>;

    roles = this.constService.USER_ROLES;

    form = new FormGroup({
        role: new FormControl('', Validators.required),
        active: new FormControl(true, Validators.required),
        foreas: new FormControl([]),
        monades: new FormControl([]),
    });

    ngOnInit() {
        this.userForeis = this.user.roles.filter(role => role.role=="EDITOR" && role.active).flatMap(r=>r.foreas);
    }

    onGridReady(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
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
                this.gridApi.hideOverlay();
                this.gridApi.setRowData(this.foreis);
            });
    }

    onFirstDataRendered(params: FirstDataRenderedEvent): void {
        if (!this.gridApi) return;

        this.gridApi.forEachNode((node) => {
            if (this.userForeis.includes(node.data.code)) {
                node.setSelected(true);
            }
        });
    }

    dismiss() {
        this.modalRef.dismiss();
    }

    onSubmit() {
        const selectedNodes = this.gridApi.getSelectedNodes();
        const selectedOrganizations = selectedNodes.map((node: any) => node.data['code']);
        let selectedOrganizationalUnits = []
        for (let data of selectedOrganizations) {
            this.store
            .select(this.selectOrganizationalUnitCodeByOrganizationCode$(data))
            .pipe(take(1))
            .subscribe((orgCodes) => {
                selectedOrganizationalUnits = selectedOrganizationalUnits.concat(...orgCodes)
            });
        }
        this.userService.setUserAccesses(this.user.email, selectedOrganizations, selectedOrganizationalUnits)
            .pipe(take(1))
            .subscribe((result) => {
                console.log(result)
            });
    }

    onSelectionChanged(event) {
        const selectedNodes = this.gridApi.getSelectedNodes();
        this.selectedData = selectedNodes.map((node: any) => node.data);
    }

    getPreferredLabel(code: string) {
        return this.organizationCodesMap.get(code);
    }

    // addRole() {
    //     const newRole = this.roleForm.value as IUserRole;

    //     const roles = [...this.currentRoles()];
    //     roles.push(newRole);

    //     this.currentRoles.set(roles);
    // }

    // editRole(role: IUserRole) {
    //     this.roleForm.patchValue(role);
    // }

    // saveRole() {
    //     const updated = this.roleForm.value as IUserRole;

    //     const roles = this.currentRoles().map(r =>
    //     r.role === updated.role ? updated : r
    //     );

    //     this.currentRoles.set(roles);
    // }

    // disableRole(role: IUserRole) {
    //     const roles = this.currentRoles().map(r =>
    //     r.role === role.role ? { ...r, active: false } : r
    //     );

    //     this.currentRoles.set(roles);
    // }

    // removeRole(role: IUserRole) {
    //     const roles = this.currentRoles().filter(r => r.role !== role.role);
    //     this.currentRoles.set(roles);
    // }

    // editForeas(role: IUserRole) {
    //     if (role.role !== 'EDITOR') return;

    //     const modalRef = this.modalService.open(UserAccessesComponent, {
    //         size: 'xl',
    //         centered: true,
    //     });

    //     modalRef.componentInstance.user = this.user;
    //     modalRef.componentInstance.modalRef = modalRef;
    // }
}
