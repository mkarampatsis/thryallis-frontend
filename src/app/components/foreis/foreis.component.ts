import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { AppState } from 'src/app/shared/state/app.state';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';

@Component({
    selector: 'app-foreis',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './foreis.component.html',
    styleUrl: './foreis.component.css',
})
export class ForeisComponent {
    constService = inject(ConstService);
    organizationService = inject(OrganizationService);
    modalService = inject(ModalService);
    foreis: IOrganizationList[] = [];

    store = inject(Store<AppState>);
    organizations$ = selectOrganizations$;

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS;
    autoSizeStrategy = this.constService.autoSizeStrategy;

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
            });
    }

    onRowDoubleClicked(event: any): void {
        console.log(event);
        this.modalService.showOrganizationDetails(event.data.code);
    }
}
