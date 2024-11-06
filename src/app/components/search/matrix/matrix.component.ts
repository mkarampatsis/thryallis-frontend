import { Component, inject } from '@angular/core';
import { take } from 'rxjs';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions  } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css'
})
export class MatrixComponent {
    constService = inject(ConstService);
    store = inject(Store<AppState>);
    organizations$ = selectOrganizations$;

    selectedRowLimit = 3;

    foreis: IOrganizationList[] = [];

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
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

    onRowSelected(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
      
        // Disable further selections if the limit is reached
        if (selectedNodes.length >= this.selectedRowLimit) {
          event.api.forEachNode((node) => {
            if (!node.isSelected()) {
              node.selectable = false; // Disable checkbox for unselected rows
            }
          });
        } else {
          // Enable selection for all rows if under the limit
          event.api.forEachNode((node) => {
            node.selectable = true; // Re-enable checkbox
          });
        }

        // Log selected rows to the console
        const selectedData = selectedNodes.map(node => node.data);
        console.log('Selected Rows:', selectedData);
      }
}
