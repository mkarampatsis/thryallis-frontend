import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component'
import { ConstService } from 'src/app/shared/services/const.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  constService = inject(ConstService);
  resourceService = inject(ResourcesService);

  store = inject(Store<AppState>);
  organizations$ = selectOrganizations$;

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

  foreis: IOrganizationList[] = [];

  defaultColDef = this.constService.defaultColDef;
  colDefs_Matrix1: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

  gridApiOrganization: GridApi<IOrganizationList>;

  selectedDataMatrix1 = [];
  matrixData1 = [];
  showTable1 = false;
  
  //   MATRIX 1 
  onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApiOrganization = params.api;
    this.gridApiOrganization.showLoadingOverlay();
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
        this.gridApiOrganization.hideOverlay();
      });
  }

  onRowSelected_Matrix1(event: any) {
    const selectedNodes = event.api.getSelectedNodes();

    // Log selected rows to the console
    this.selectedDataMatrix1 = selectedNodes.map(node => node.data);
    const codes = selectedNodes.map(node => node.data.code);
    this.resourceService.getFacilitiesByListOfOrganizationCodes(codes)
      .subscribe(response => {
        const body = response.body;
        const status = response.status;
        if (status === 200) {
          this.matrixData1 = body;
        }
      })
    
    if (this.selectedDataMatrix1.length > 0) {
      this.showTable1 = true;
    } else {
      this.showTable1 = false
    }
  }

  clearSelectionMatrix1() {
    if (this.gridApiOrganization) {
      this.gridApiOrganization.deselectAll(); // Clear all selected rows
      this.gridApiOrganization.setFilterModel(null);
    }
  }

  onBtnExportMatrix1() {
    this.resourceService.onExportToExcelMatrix1(this.matrixData1);
  }
}
