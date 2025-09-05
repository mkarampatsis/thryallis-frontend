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
import { ModalService } from 'src/app/shared/services/modal.service';
import { take } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { IFacilitySummary } from 'src/app/shared/interfaces/facility/facility';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, AgGridAngular, NgbTooltipModule],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css'
})
export class MatrixComponent {
  constService = inject(ConstService);
  resourceService = inject(ResourcesService);
  modalService = inject(ModalService);

  store = inject(Store<AppState>);
  organizations$ = selectOrganizations$;

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

  objectKeys = Object.keys;
  // summary: { [organization: string]: IFacilitySummary } = {};

  foreis: IOrganizationList[] = [];

  defaultColDef = this.constService.defaultColDef;
  colDefs_Organizations: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

  gridMatrix1: GridApi<IOrganizationList>;
  gridMatrix2: GridApi<IOrganizationList>;

  selectedDataMatrix1 = [];
  matrixData1 = [];
  showTable1 = false;
  loadingMatrix1 = false;

  selectedDataMatrix2 = [];
  matrixData2 : { [organization: string]: IFacilitySummary } = {};
  showTable2 = false;
  loadingMatrix2 = false;

  selectedRowLimit = 2;
  
  //   MATRIX 1 
  onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
    this.gridMatrix1 = params.api;
    this.gridMatrix1.showLoadingOverlay();
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
      this.gridMatrix1.hideOverlay();
    });
  }

  onRowSelected_Matrix1(event: any) {
    const selectedNodes = event.api.getSelectedNodes();

    // Log selected rows to the console
    this.selectedDataMatrix1 = selectedNodes.map(node => node.data);
    const codes = selectedNodes.map(node => node.data.code);
    this.showTable1 = false;
    this.loadingMatrix1 = true;

    this.resourceService.getFacilitiesByListOfOrganizationCodes(codes)
    .subscribe(response => {
      const body = response.body;
      const status = response.status;
      if (status === 200) {
        this.matrixData1 = body;
        this.showTable1 = false
        this.loadingMatrix1 = false;
      }
    })
  }

  showDetailsMatrix1(code: string){
    this.modalService.showResourcesDetails(code);
  }

  onBtnExportMatrix1() {
    this.resourceService.onExportToExcelMatrix1(this.matrixData1);
  }

  // Matrix 2 
  onGridReady_Matrix2(params: GridReadyEvent<IOrganizationList>): void {
    this.gridMatrix2 = params.api;
    this.gridMatrix2.showLoadingOverlay();
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
      this.gridMatrix2.hideOverlay();
    });
  }

  onRowSelected_Matrix2(event: any) {
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
    this.selectedDataMatrix2 = selectedNodes.map(node => node.data);
    const codes = selectedNodes.map(node => node.data.code);
    this.showTable2 = false
    this.loadingMatrix2 = true;
    
    this.resourceService.getFacilityDetailsByOrganizations(codes)
    .subscribe(response => {
      const body = response.body;
      const status = response.status;
      if (status === 200) {
        console.log(body);
        this.matrixData2 = this.resourceService.aggregateData(body);
        this.showTable2 = true;
        this.loadingMatrix2 = false;
      }
    })
  }

  onBtnExportMatrix2() {
    this.resourceService.onExportToExcelMatrix2(this.matrixData2);
  }

  clearSelectionMatrix(matrix: number) {
    if (matrix == 1) {
      if (this.gridMatrix1) {
        this.gridMatrix1.deselectAll(); // Clear all selected rows
        this.gridMatrix1.setFilterModel(null);
      }
    } else if (matrix=2) {
      if (this.gridMatrix2) {
        this.gridMatrix2.deselectAll(); // Clear all selected rows
        this.gridMatrix2.setFilterModel(null);
      }
    }
  }
}
