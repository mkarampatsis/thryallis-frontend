import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import { ConstService } from 'src/app/shared/services/const.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { map, take } from 'rxjs';

@Component({
    selector: 'app-select-organization',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './select-organization.component.html',
    styleUrl: './select-organization.component.css',
})
export class SelectOrganizationComponent {
    @Output() selectedOrganization = new EventEmitter<string>();
    constService = inject(ConstService);
    organizationService = inject(OrganizationService);
    organizations: IOrganizationList[] = [];

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS;
    autoSizeStrategy = this.constService.autoSizeStrategy;

    rowSelection: 'single' | 'multiple' = 'single';
    currentOrganization: IOrganizationList;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

    gridApi: GridApi<IOrganizationList>;

    onGridReady(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.organizationService
            .getAllOrganizations()
            .pipe(
                take(1),
                map((data) => {
                    return data.map((org) => {
                        return {
                            ...org,
                            organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
                            subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
                        };
                    });
                }),
            )
            .subscribe((data) => {
                this.gridApi.hideOverlay();
                this.organizations = data;
            });
    }

    onSelectionChanged(): void {
        const selectedRows = this.gridApi.getSelectedRows();
        this.currentOrganization = selectedRows[0];
    }

    onSelectedOrganization(): void {
        this.selectedOrganization.emit(this.currentOrganization.code);
    }
}
