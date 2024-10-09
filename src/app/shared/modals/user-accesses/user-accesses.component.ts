import { Component, inject } from '@angular/core';
import { IUser } from '../../interfaces/auth';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AppState } from '../../state/app.state';
import { selectOrganizations$ } from '../../state/organizations.state';
import { ConstService } from '../../services/const.service';
import { GridLoadingOverlayComponent } from '../grid-loading-overlay/grid-loading-overlay.component';
import { take } from 'rxjs';
import { IOrganizationList } from '../../interfaces/organization/organization-list.interface';
import { IForeas } from '../../interfaces/foreas/foreas.interface';
import { selectOrganizationalUnitCodeByOrganizationCode$} from 'src/app/shared/state/organizational-units.state';
import { UserService } from '../../services/user.service';

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
                this.selectRows();
            });
    }

    selectRows() {
        console.log('Selecting rows');
        const foreis = this.user.roles.find((data) => data.role === 'EDITOR')?.foreas ?? [];
        this.gridApi.forEachNode((node) => {
            if (foreis.includes(node.data.code)) node.setSelected(true);
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
}
