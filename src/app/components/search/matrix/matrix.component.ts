import { Component, inject } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular, } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { SearchService } from 'src/app/shared/services/search.service';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { forkJoin, map } from 'rxjs';
import { ForeasService } from 'src/app/shared/services/foreas.service';
import { MonadesService } from 'src/app/shared/services/monades.service';
import { RemitService } from 'src/app/shared/services/remit.service';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css'
})
export class MatrixComponent {
  constService = inject(ConstService);
  foreasService = inject(ForeasService);
  monadesService = inject(MonadesService);
  remitsService = inject(RemitService);
  legalProvisionService = inject(LegalProvisionService)

  loading = false;

  searchService = inject(SearchService)

  foreis: IOrganizationList[] = [];
  monades: IOrganizationUnitList[] = [];

  defaultColDef = this.constService.defaultColDef;
  autoSizeStrategy = this.constService.autoSizeStrategy;
  private showCheckboxes = true;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };
  loadingOverlayComponentRemit = GridLoadingOverlayComponent;
  loadingOverlayComponentParamsRemit = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

  // Matrix 1
  colDefs_Matrix1: ColDef[];
  gridApiOrganization: GridApi<IOrganizationList>;
  private filterChange_organizations$ = new Subject<void>();
  private sortChange_organizations$ = new Subject<void>();
  selectedDataMatrix1 = []
  matrixData1 = [];
  showTable1 = false;
  showError1 = false;
  
  
  // Matrix 2
  colDefs_Matrix2: ColDef[];
  gridApiOrganizationalUnit: GridApi<IOrganizationList>;
  private filterChange_organizational_units$ = new Subject<void>();
  private sortChange_organizational_units$ = new Subject<void>();
  selectedDataMatrix2 = [];
  matrixData2 = [];
  showTable2 = false;
  showError2 = false;

  // Matrix 3
  colDefs_Matrix3: ColDef[];
  gridApiRemit: GridApi<IRemit>;
  private filterChange_remits$ = new Subject<void>();
  private sortChange_remits$ = new Subject<void>();
  selectedDataMatrix3 = [];
  matrixData3 = [];
  showTable3 = false;
  showError3 = false;
  filteredRows = [];
  gridContext = {searchTerm: ''};
  remits: IRemit[] = [];

  selectedRowLimit = 2;

  ngOnInit() {
    this.resetGridState_organizations()
    this.colDefs_Matrix1 = this.constService.ORGANIZATIONS_COL_DEFS_SDAD.map((col, index) => {
      if (index === 0 && !this.showCheckboxes) {
        return { ...col, hide: true };
      }
      return col;
    });

    this.resetGridState_organizational_units()
    this.colDefs_Matrix2 = this.constService.ORGANIZATION_UNITS_COL_DEFS_SDAD.map((col, index) => {
      if (index === 0 && !this.showCheckboxes) {
        return { ...col, hide: true };
      }
      return col;
    });

    this.colDefs_Matrix3 = this.constService.REMITS_COL_DEFS.map((col, index) => {
      if (index === 0 && !this.showCheckboxes) {
        return { ...col, hide: true };
      }
      return col;
    });
  }

  onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApiOrganization = params.api;

    this.restoreGridState_organizations();

    const datasource: IDatasource = {
      getRows: async (p: IGetRowsParams) => {

        this.gridApiOrganization.showLoadingOverlay();

        const page = p.startRow / 100 + 1;
        const pageSize = 100;

        try {
          const response = await firstValueFrom(
            this.foreasService
              .getAllForeisPagination(
                page,
                pageSize,
                p.filterModel,
                p.sortModel
              )
          );

          const transformedRows = response.rows.map((org: IOrganizationList) => ({
            ...org,
          }));

          this.gridApiOrganization.hideOverlay();

          p.successCallback(transformedRows, response.total);
        } catch (err) {
          console.error('Error fetching data:', err);
          this.gridApiOrganization.showNoRowsOverlay();
          p.failCallback();
        }
      },
    }

    this.gridApiOrganization.setGridOption('datasource',datasource);
  }

  onRowSelected_Matrix1(event: any) {
    const selectedNodes = event.api.getSelectedNodes();
    this.showTable1 = false;
    this.showError1 = false;

    // Log selected rows to the console
    this.selectedDataMatrix1 = selectedNodes.map(node => node.data);
    this.searchService.transformMatrixData_1(this.selectedDataMatrix1)
      .subscribe(data => {
        this.matrixData1 = data;
        if (this.matrixData1.length > 0) {
          this.showTable1 = true;
          this.showError1 = false;
        } else {
          this.showTable1 = false
          this.showError1 = true
        }
      })
  }

  showMatrixData1(code: string, unitType: string) {
    const result = this.matrixData1.filter((data) => {
      if (code === data.organizationCode && data.description === unitType)
        return data
    })
    if (result.length > 0)
      return result[0]['count']
    else
      return '-'
  }

  clearSelectionMatrix1() {
    if (this.gridApiOrganization) {
      this.gridApiOrganization.deselectAll(); // Clear all selected rows
      this.gridApiOrganization.setFilterModel(null);
    }
  }

  onBtnExportMatrix1() {
    this.searchService.onExportToExcelMatrix(this.matrixData1);
  }

  onFilterChanged_organizations() {
    this.filterChange_organizations$.next();
  }

  onSortChanged_organizations() {
    this.sortChange_organizations$.next();
  }

  onColumnStateChanged_organizations() {
    this.saveGridState_organizations();
  }

  // Save grid layout, sorting, and filters
  private saveGridState_organizations() {
    if (!this.gridApiOrganization) return;

    const filterModel = this.gridApiOrganization.getFilterModel();
    const columnState = this.gridApiOrganization.getColumnState();
    const sortModel = (this.gridApiOrganization as any).getSortModel?.();

    const state = {
      filterModel,
      columnState,
      sortModel,
    };

    localStorage.setItem('orgGridState', JSON.stringify(state));
  }

  private restoreGridState_organizations() {
    const savedState = localStorage.getItem('orgGridState');
    if (!savedState) return;

    try {
      const { filterModel, columnState, sortModel } = JSON.parse(savedState);

      setTimeout(() => {
        if (this.gridApiOrganization) {
          if (filterModel) this.gridApiOrganization.setFilterModel(filterModel);
          if (columnState)
            this.gridApiOrganization.applyColumnState({ state: columnState, applyOrder: true });

          (this.gridApiOrganization as any).setSortModel?.(sortModel);

          this.gridApiOrganization.refreshInfiniteCache?.();  // if using infinite model
          this.gridApiOrganization.refreshServerSide?.({ purge: true });
        }
      }, 200);
    } catch (err) {
      console.error('Failed to restore grid state:', err);
    }
  }

  resetGridState_organizations() {
    localStorage.removeItem('orgGridState');

    if (this.gridApiOrganization) {
      this.gridApiOrganization.setFilterModel(null);
      (this.gridApiOrganization as any).setSortModel?.(null);
      this.gridApiOrganization.applyColumnState({ state: [], applyOrder: true });

      this.gridApiOrganization.refreshInfiniteCache?.();
      this.gridApiOrganization.refreshServerSide?.({ purge: true });
    }
  }

  //   MATRIX 2 
  onGridReady_Matrix2(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApiOrganizationalUnit = params.api;

    this.restoreGridState_organizational_units();

    const datasource: IDatasource  = {
      getRows: async (p: IGetRowsParams) => {

        this.gridApiOrganizationalUnit.showLoadingOverlay();

        const page = p.startRow / 100 + 1;
        const pageSize = 100;

        try {
          const response = await firstValueFrom(
            this.monadesService
            .getAllMonadesPagination(
              page, 
              pageSize, 
              p.filterModel, 
              p.sortModel
            )
          );
          
          const transformedRows = response.rows.map((org: any) => ({
            ...org,
          }));

          this.gridApiOrganizationalUnit.hideOverlay();
          
          p.successCallback( transformedRows, response.total );
        } catch (err) {
          console.error('Error fetching data:', err);
          this.gridApiOrganizationalUnit.showNoRowsOverlay();
          p.failCallback();
        }
      },
    }

    this.gridApiOrganizationalUnit.setGridOption('datasource',datasource);
  }

  onRowSelected_Matrix2(event: any) {
    const selectedNodes = event.api.getSelectedNodes();
    this.showTable2 = false;
    this.showError2 = false;

    // Log selected rows to the console
    this.selectedDataMatrix2 = selectedNodes.map(node => node.data);
    this.matrixData2 = this.searchService.transformMatrixData_2(this.selectedDataMatrix2)

    if (this.matrixData2.length > 0) {
      this.showTable2 = true;
      this.showError2 = false;
    } else {
      this.showTable2 = false;
      this.showError2 = true;
    }

  }

  showMatrixData2(code: string, unitType: string) {
    const result = this.matrixData2.filter((data) => {
      if (code === data.organizationCode && data.description === unitType)
        return data
    })

    if (result.length > 0)
      return result[0]['count']
    else
      return '-'
  }

  clearSelectionMatrix2() {
    if (this.gridApiOrganizationalUnit) {
      this.gridApiOrganizationalUnit.deselectAll(); // Clear all selected rows
      this.gridApiOrganizationalUnit.setFilterModel(null);
    }
  }

  onBtnExportMatrix2() {
    this.searchService.onExportToExcelMatrix(this.matrixData2);
  }

  onFilterChanged_organizational_units() {
    this.filterChange_organizational_units$.next();
  }

  onSortChanged_organizational_units() {
    this.sortChange_organizational_units$.next();
  }

  onColumnStateChanged_organizational_units() {
    this.saveGridState_organizational_units();
  }

  // Save grid layout, sorting, and filters
  private saveGridState_organizational_units() {
    if (!this.gridApiOrganizationalUnit) return;

    const filterModel = this.gridApiOrganizationalUnit.getFilterModel();
    const columnState = this.gridApiOrganizationalUnit.getColumnState();
    const sortModel = (this.gridApiOrganizationalUnit as any).getSortModel?.();

    const state = {
      filterModel,
      columnState,
      sortModel,
    };

    localStorage.setItem('orgUnitsGridState', JSON.stringify(state));
  }

  // Restore saved grid state
  private restoreGridState_organizational_units() {
    const savedState = localStorage.getItem('orgUnitsGridState');
    if (!savedState) return;

    try {
      const { filterModel, columnState, sortModel  } = JSON.parse(savedState);

      setTimeout(() => {
        if (this.gridApiOrganizationalUnit) {
          if (filterModel) this.gridApiOrganizationalUnit.setFilterModel(filterModel);
          if (columnState)
            this.gridApiOrganizationalUnit.applyColumnState({ state: columnState, applyOrder: true });
          
           (this.gridApiOrganizationalUnit as any).setSortModel?.(sortModel);

          this.gridApiOrganizationalUnit.refreshInfiniteCache?.();  // if using infinite model
          this.gridApiOrganizationalUnit.refreshServerSide?.({ purge: true });
        }
      }, 200);
    } catch (err) {
      console.error('Failed to restore grid state:', err);
    }
  }

  resetGridState_organizational_units() {
    localStorage.removeItem('orgUnitsGridState');
    
    if (this.gridApiOrganizationalUnit) {
      this.gridApiOrganizationalUnit.setFilterModel(null);
      (this.gridApiOrganizationalUnit as any).setSortModel?.(null);
      this.gridApiOrganizationalUnit.applyColumnState({ state: [], applyOrder: true });

      this.gridApiOrganizationalUnit.refreshInfiniteCache?.();
      this.gridApiOrganizationalUnit.refreshServerSide?.({ purge: true });
    }
  }

  //   MATRIX 3 
  onGridReady_Matrix3(params: GridReadyEvent<IRemit>): void {
    this.gridApiRemit = params.api;

    this.restoreGridState_remits();
    
    const datasource: IDatasource = {
      getRows: async (p: IGetRowsParams) => {

        this.gridApiRemit.showLoadingOverlay();

        const page = p.startRow / 100 + 1;
        const pageSize = 100;
        try {
          const response = await firstValueFrom(
            this.remitsService
              .getAllRemitsPagination(
                page,
                pageSize,
                p.filterModel,
                p.sortModel
              )
          );
          
          this.remits = response.rows.map((remit) => {
            return {
              ...remit,
            };
          });

          this.gridApiRemit.hideOverlay();

          p.successCallback(this.remits, response.total);
        } catch (err) {
          console.error('Error fetching data:', err);
          this.gridApiRemit.showNoRowsOverlay();
          p.failCallback();
        }
      },
    }
    this.gridApiRemit.setGridOption('datasource',datasource);
  }

  onRowSelected_Matrix3(event: any) {
    const selectedNodes = event.api.getSelectedNodes();
    this.showTable3 = false;
    this.showError3 = false;

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
    this.selectedDataMatrix3 = selectedNodes.map(node => node.data);
    // console.log("selected",this.selectedDataMatrix3);
    // console.log("filteredRows",this.filteredRows);
    
    this.matrixData3 = this.searchService.transformMatrixData_3(this.selectedDataMatrix3, this.filteredRows)
    if (this.matrixData3.length > 0) {
      console.log("matrixData3",this.matrixData3);
      this.showTable3 = true;
      this.showError3 = false;
    } else {
      this.showTable3 = false;
      this.showError3 = true;
    }
  }

  // onFilterChanged(event: any) {
  //   this.filteredRows = [];
  //   // let filteredRowCount = 0
  //   this.gridApiRemit.forEachNodeAfterFilter((data) => {
  //     console.log(data.data);
  //     // Sxolio apo Marko giati epistrefei lathos apotelesmata
  //     // this.filteredRows.push(data.data);
      
  //     //  filteredRowCount++;
  //   });
  //   //  console.log(filteredRowCount);
  // }

  clearSelectionMatrix3() {
    if (this.gridApiRemit) {
      this.gridApiRemit.deselectAll(); // Clear all selected rows
      this.gridApiRemit.setFilterModel(null);
    }
  }

  onBtnExportMatrix3CSV() {
    this.loading = true;
    // console.log(this.selectedDataMatrix3)

    const observables = this.matrixData3.map(doc =>
      this.legalProvisionService
        .getLegalProvisionsByRegulatedRemit(doc._id.$oid)
        .pipe(
          map(legalProvisionData => {
            // Create a shallow copy of the object to make it mutable
            const mutableDoc = { ...doc };
            this.selectedDataMatrix3.map(row => {
              if (row.organizationalUnitCode === doc.organizationalUnitCode) {
                mutableDoc.organizationPreferredLabel = row.organizationLabel
                mutableDoc.organizationalUnitPreferredLabel = row.organizationUnitLabel
              }
            })
            mutableDoc.legalProvisionDetails = legalProvisionData;
            return mutableDoc;
          })
        )
    );

    // Use forkJoin to handle all the requests simultaneously
    forkJoin(observables).subscribe(
      updatedArray => {
        // Update the original data array if needed
        this.matrixData3.length = 0; // Clear original array
        this.matrixData3.push(...updatedArray); // Push updated objects back
        //   console.log('Updated data array:', this.matrixData3);
        this.searchService.onExportCSV(this.matrixData3);
        this.loading = false;
      },
      error => {
        console.error('Error fetching legal provisions:', error);
      }
    );
  }

  onBtnExportMatrix3Excel() {
    this.loading = true;
    // console.log(this.selectedDataMatrix3)

    const observables = this.matrixData3.map(doc =>
      this.legalProvisionService
        .getLegalProvisionsByRegulatedRemit(doc._id.$oid)
        .pipe(
          map(legalProvisionData => {
            // Create a shallow copy of the object to make it mutable
            const mutableDoc = { ...doc };
            this.selectedDataMatrix3.map(row => {
              if (row.organizationalUnitCode === doc.organizationalUnitCode) {
                mutableDoc.organizationPreferredLabel = row.organizationLabel
                mutableDoc.organizationalUnitPreferredLabel = row.organizationUnitLabel
              }
            })
            mutableDoc.legalProvisionDetails = legalProvisionData;
            return mutableDoc;
          })
        )
    );

    // Use forkJoin to handle all the requests simultaneously
    forkJoin(observables).subscribe(
      updatedArray => {
        // Update the original data array if needed
        this.matrixData3.length = 0; // Clear original array
        this.matrixData3.push(...updatedArray); // Push updated objects back
        //   console.log('Updated data array:', this.matrixData3);
        this.searchService.onExportToExcel(this.matrixData3);
        this.loading = false;
      },
      error => {
        console.error('Error fetching legal provisions:', error);
      }
    );
  }

  onFilterChanged_remits() {
    this.filterChange_remits$.next();
    this.gridContext.searchTerm = this.gridApiRemit.getFilterModel()['remitText']?.filter || '';
  }

  onSortChanged_remits() {
    this.sortChange_remits$.next();
  }

  onColumnStateChanged_remits() {
    this.saveGridState_remits();
  }

  // Save grid layout, sorting, and filters
  private saveGridState_remits() {
    if (!this.gridApiRemit) return;

    const filterModel = this.gridApiRemit.getFilterModel();
    const columnState = this.gridApiRemit.getColumnState();
    const sortModel = (this.gridApiRemit as any).getSortModel?.();

    const state = {
      filterModel,
      columnState,
      sortModel,
    };

    localStorage.setItem('remitGridState', JSON.stringify(state));
  }

  private restoreGridState_remits() {
    const savedState = localStorage.getItem('remitGridState');
    if (!savedState) return;

    try {
      const { filterModel, columnState, sortModel } = JSON.parse(savedState);

      setTimeout(() => {
        if (this.gridApiRemit) {
          if (filterModel) this.gridApiRemit.setFilterModel(filterModel);
          if (columnState)
            this.gridApiRemit.applyColumnState({ state: columnState, applyOrder: true });

          (this.gridApiRemit as any).setSortModel?.(sortModel);

          this.gridApiRemit.refreshInfiniteCache?.();  // if using infinite model
          this.gridApiRemit.refreshServerSide?.({ purge: true });
        }
      }, 200);
    } catch (err) {
      console.error('Failed to restore grid state:', err);
    }
  }

  resetGridState_remits() {
    localStorage.removeItem('remitGridState');

    if (this.gridApiRemit) {
      this.gridApiRemit.setFilterModel(null);
      (this.gridApiRemit as any).setSortModel?.(null);
      this.gridApiRemit.applyColumnState({ state: [], applyOrder: true });

      this.gridApiRemit.refreshInfiniteCache?.();
      this.gridApiRemit.refreshServerSide?.({ purge: true });
    }
  }
}

