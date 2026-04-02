import { Component, inject } from '@angular/core';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { firstValueFrom, Subject, Subscription, take } from 'rxjs';

import { OrganizationTreeReportComponent } from 'src/app/shared/components/organization-tree-report/organization-tree-report.component';
import { MonadesService } from 'src/app/shared/services/monades.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [AgGridAngular, OrganizationTreeReportComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  constService = inject(ConstService);
  monadesService = inject(MonadesService);

  loading = false;
  showReport = false;
  showReportText = '';

  monades: IOrganizationUnitList[] = [];

  defaultColDef = this.constService.defaultColDef;
  autoSizeStrategy = this.constService.autoSizeStrategy;
  
  colDefs: ColDef[] 
  gridApiOrganizationalUnit: GridApi<IOrganizationList>;

  selectedData = []
  matrixData = []
  showTable = false
  private filterChange$ = new Subject<void>();
  private sortChange$ = new Subject<void>();
  private showCheckboxes = false;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

  organizationCode: string | null = null;
  code: string | null = null;
  organizationName: string | null = null

  ngOnInit() {
    this.resetGridState()
    this.colDefs = this.constService.ORGANIZATION_UNITS_COL_DEFS_SDAD.map((col, index) => {
      if (index === 0 && !this.showCheckboxes) {
        return { ...col, hide: true };
      }
      return col;
    });
  }

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApiOrganizationalUnit = params.api;

    this.restoreGridState();

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

  onCellClicked(event: any): void {
    console.log(event)
    this.organizationCode = event.data['organizationCode']['code']
    this.organizationName = event.data['organizationCode']['preferredLabel']

    this.showReport = false;
    this.showReportText = ''

    if (event.colDef.field == "preferredLabel") {
      this.code = event.data['code'];
      this.showReport = true;
      this.showReportText = event.data['preferredLabel'];
    } else if (event.colDef.field == "organizationCode.preferredLabel") {
      console.log(event.data['organizationCode']['preferredLabel'])
      this.code = event.data['organizationCode']['code'];
      this.showReport = true;
      this.showReportText = event.data['organizationCode']['preferredLabel'];
    } else if (event.colDef.field == "supervisorUnitCode.preferredLabel") {
      this.code = event.data['supervisorUnitCode']['code'];
      this.showReport = true;
      this.showReportText = event.data['supervisorUnitCode']['preferredLabel'];
    } else {
      this.showReport = false;
      this.showReportText = ''
    }
  }

  clearSelection() {
    this.code = null;
    this.showReportText = ''
    this.showReport = false;
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
  private restoreGridState() {
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

  resetGridState() {
    localStorage.removeItem('orgUnitsGridState');
    
    if (this.gridApiOrganizationalUnit) {
      this.gridApiOrganizationalUnit.setFilterModel(null);
      (this.gridApiOrganizationalUnit as any).setSortModel?.(null);
      this.gridApiOrganizationalUnit.applyColumnState({ state: [], applyOrder: true });

      this.gridApiOrganizationalUnit.refreshInfiniteCache?.();
      this.gridApiOrganizationalUnit.refreshServerSide?.({ purge: true });
    }
  }
}
