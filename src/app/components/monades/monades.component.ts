import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  IDatasource, 
  IGetRowsParams, 
} from 'ag-grid-community';
import { Subject, firstValueFrom} from 'rxjs';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { MonadesService } from 'src/app/shared/services/monades.service';

@Component({
  selector: 'app-monades',
  standalone: true,
  imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './monades.component.html',
  styleUrl: './monades.component.css',
})
export class MonadesComponent {
  constService = inject(ConstService);
  organizationalUnitService = inject(OrganizationalUnitService);
  modalService = inject(ModalService);
  monadesService = inject(MonadesService);

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[];
  autoSizeStrategy = this.constService.autoSizeStrategy;
  
  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση μονάδων...' };

  gridApi: GridApi<IOrganizationUnitList>;
  private filterChange$ = new Subject<void>();
  private sortChange$ = new Subject<void>();
  private showCheckboxes = false;

  ngOnInit() {
    this.colDefs = this.constService.ORGANIZATION_UNITS_COL_DEFS_SDAD.map((col, index) => {
      if (index === 0 && !this.showCheckboxes) {
        return { ...col, hide: true };
      }
      return col;
    });
  }

  onGridReady(params: GridReadyEvent<IOrganizationUnitList>): void {
    this.gridApi = params.api;

    this.restoreGridState();

    const datasource: IDatasource  = {
      getRows: async (p: IGetRowsParams) => {

        this.gridApi.showLoadingOverlay();

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

          this.gridApi.hideOverlay();
          
          p.successCallback( transformedRows, response.total );
        } catch (err) {
          console.error('Error fetching data:', err);
          this.gridApi.showNoRowsOverlay();
          p.failCallback();
        }
      },
    }

    this.gridApi.setGridOption('datasource',datasource);
  }

  onCellClicked(event: any): void {
    if (event.colDef.field == "organizationCode.preferredLabel") {
      this.modalService.showOrganizationDetails(event.data.organizationCode.code);
    } else if (event.colDef.field == "preferredLabel") {
      this.modalService.showOrganizationUnitDetails(event.data.code);
    } else if (event.colDef.field == "supervisorUnitCode.preferredLabel") {
      this.modalService.showOrganizationUnitDetails(event.data.supervisorUnitCode.code);
    } 
  }

  onFilterChanged() {
    this.filterChange$.next();
  }

  onSortChanged() {
    this.sortChange$.next();
  }

  onColumnStateChanged() {
    this.saveGridState();
  }

  // Save grid layout, sorting, and filters
  private saveGridState() {
    if (!this.gridApi) return;

    const filterModel = this.gridApi.getFilterModel();
    const columnState = this.gridApi.getColumnState();
    const sortModel = (this.gridApi as any).getSortModel?.();

    const state = {
      filterModel,
      columnState,
      sortModel,
    };

    localStorage.setItem('orgUnitsGridState', JSON.stringify(state));
  }

  // Restore saved grid state
  private restoreGridState() {
    const savedState = localStorage.getItem('orgUnitsGridState');
    if (!savedState) return;

    try {
      const { filterModel, columnState, sortModel  } = JSON.parse(savedState);

      setTimeout(() => {
        if (this.gridApi) {
          if (filterModel) this.gridApi.setFilterModel(filterModel);
          if (columnState)
            this.gridApi.applyColumnState({ state: columnState, applyOrder: true });
          
           (this.gridApi as any).setSortModel?.(sortModel);

          this.gridApi.refreshInfiniteCache?.();  // if using infinite model
          this.gridApi.refreshServerSide?.({ purge: true });
        }
      }, 200);
    } catch (err) {
      console.error('Failed to restore grid state:', err);
    }
  }

  resetGridState() {
    localStorage.removeItem('orgUnitsGridState');
    
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      (this.gridApi as any).setSortModel?.(null);
      this.gridApi.applyColumnState({ state: [], applyOrder: true });

      this.gridApi.refreshInfiniteCache?.();
      this.gridApi.refreshServerSide?.({ purge: true });
    }
  }
  
}