import { Component, inject } from '@angular/core';
import { take } from 'rxjs';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';
import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions  } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { SearchService } from 'src/app/shared/services/search.service';

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
    organizational_units$ = selectOrganizationalUnits$

    searchService = inject(SearchService)

    selectedRowLimit = 2;
    selectedData = []

    foreis: IOrganizationList[] = [];
    monades: IOrganizationUnitList[] = [];

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
    organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs_Matrix1: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
    colDefs_Matrix2: ColDef[] = this.constService.ORGANIZATION_UNITS_COL_DEFS_CHECKBOXES
    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

    gridApi: GridApi<IOrganizationList>;
    
    matrixData1 = []
    showTable1 = false
    
    matrixData2 = []
    showTable2 = false

    //   MATRIX 1 
    onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.store
            .select(this.organizations$)
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

    onRowSelected_Matrix1(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
      
        // Disable further selections if the limit is reached
        // if (selectedNodes.length >= this.selectedRowLimit) {
        //   event.api.forEachNode((node) => {
        //     if (!node.isSelected()) {
        //       node.selectable = false; // Disable checkbox for unselected rows
        //     }
        //   });
        // } else {
          // Enable selection for all rows if under the limit
        //   event.api.forEachNode((node) => {
        //     node.selectable = true; // Re-enable checkbox
        //   });
        // }

        // Log selected rows to the console
        this.selectedData = selectedNodes.map(node => node.data);
        // console.log(this.selectedData)
        this.matrixData1 = this.searchService.transformMatrixData_1(this.selectedData)
        if (this.matrixData1.length>0){
            this.showTable1 = true
            // console.log("1>>",this.matrixData1)
        }
    }

    showMatrixData1(code:string, unitType:string){
        const result =  this.matrixData1.filter((data)=>{
            // console.log(code, data.organizationCode, data.description, unitType)
            if (code===data.organizationCode && data.description===unitType)
                return data
        }) 
        // console.log("result>>",unitType, result)
        if (result.length>0)
            return result[0]['count']
        else 
            return '-'
      }

    //   MATRIX 2 
      onGridReady_Matrix2(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.store
            .select(this.organizational_units$)
            .pipe(take(1))
            .subscribe((data) => {
                this.monades = data.map((org) => {
                    return {
                        ...org,
                        organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
                        organization: this.organizationCodesMap.get(org.organizationCode),
                        subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
                    };
                });
                this.gridApi.hideOverlay();
            });
    }

    onRowSelected_Matrix2(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
      
        // Disable further selections if the limit is reached
        // if (selectedNodes.length >= this.selectedRowLimit) {
        //   event.api.forEachNode((node) => {
        //     if (!node.isSelected()) {
        //       node.selectable = false; // Disable checkbox for unselected rows
        //     }
        //   });
        // } else {
          // Enable selection for all rows if under the limit
        //   event.api.forEachNode((node) => {
        //     node.selectable = true; // Re-enable checkbox
        //   });
        // }

        // Log selected rows to the console
        this.selectedData = selectedNodes.map(node => node.data);
        console.log(this.selectedData)
        this.matrixData2 = this.searchService.transformMatrixData_2(this.selectedData)
        console.log("1>>",this.matrixData2)
        if (this.matrixData2.length>0){
            this.showTable2 = true
            console.log("2>>",this.matrixData2)
        }
        
      }

      showMatrixData2(code:string, unitType:string){
        const result =  this.matrixData2.filter((data)=>{
            // console.log(code, data.organizationCode, data.description, unitType)
            if (code===data.organizationCode && data.description===unitType)
                return data
        }) 
        console.log("result>>",unitType, result)
        if (result.length>0)
            return result[0]['count']
        else 
            return '-'
      }
}
