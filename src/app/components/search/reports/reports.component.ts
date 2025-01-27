import { Component, inject } from '@angular/core';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions  } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

import { Subscription, take } from 'rxjs';

import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
    constService = inject(ConstService);
    store = inject(Store<AppState>);

    subscriptions: Subscription[] = [];
    
    organizations$ = selectOrganizations$;
    organizational_units$ = selectOrganizationalUnits$;
    loading = false; 

    foreis: IOrganizationList[] = [];
    monades: IOrganizationUnitList[] = [];
    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
    organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs_Matrix1: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

    gridApiOrganization: GridApi<IOrganizationList>;
    gridApiOrganizationalUnit: GridApi<IOrganizationList>;

    selectedDataMatrix1 = []
    matrixData1 = []
    showTable1 = false

    // onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
    //     this.gridApiOrganization = params.api;
    //     this.gridApiOrganization.showLoadingOverlay();
    //     this.store
    //         .select(this.organizations$)
    //         .pipe(take(1))
    //         .subscribe((data) => {
    //             this.foreis = data.map((org) => {
    //                 return {
    //                     ...org,
    //                     organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
    //                     subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
    //                 };
    //             });
    //             this.gridApiOrganization.hideOverlay();
    //         });
    // }
    onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApiOrganizationalUnit = params.api;
        this.gridApiOrganizationalUnit.showLoadingOverlay();
        this.subscriptions.push(
            this.store.select(this.organizational_units$).subscribe((data) => {
                this.monades = data.map((org) => {
                    return {
                        ...org,
                        organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
                        organization: this.organizationCodesMap.get(org.organizationCode),
                        subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
                    };
                });
                this.gridApiOrganizationalUnit.hideOverlay();
            }),
        )
    }

    onRowSelected_Matrix1(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
        console.log(selectedNodes);
        
        // Disable further selections if the limit is reached
        if (selectedNodes.length >= 1) {
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
         this.selectedDataMatrix1 = selectedNodes.map(node => node.data);
        // this.matrixData1 = this.searchService.transformMatrixData_1(this.selectedDataMatrix1)

        if (this.selectedDataMatrix1.length>0){
            this.showTable1 = true;
        } else {
            this.showTable1= false
        }
    }

    clearSelectionMatrix1() {
        if (this.gridApiOrganization) {
            this.gridApiOrganization.deselectAll(); // Clear all selected rows
            this.gridApiOrganization.setFilterModel(null);
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    
}
