import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams
} from 'ag-grid-community';
import { Subject, firstValueFrom } from 'rxjs';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ForeasService } from 'src/app/shared/services/foreas.service';

@Component({
  selector: 'app-foreis',
  standalone: true,
  imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './foreis.component.html',
  styleUrl: './foreis.component.css',
})
export class ForeisComponent {
  constService = inject(ConstService);
  organizationService = inject(OrganizationService);
  modalService = inject(ModalService);
  foreasService = inject(ForeasService);

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_SDAD;
  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση μονάδων...' };

  gridApi: GridApi<IOrganizationList>;
  private filterChange$ = new Subject<void>();
  private sortChange$ = new Subject<void>();

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;

    this.restoreGridState();

    const datasource: IDatasource = {
      getRows: async (p: IGetRowsParams) => {

        this.gridApi.showLoadingOverlay();

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

          this.gridApi.hideOverlay();

          p.successCallback(transformedRows, response.total);
        } catch (err) {
          console.error('Error fetching data:', err);
          this.gridApi.showNoRowsOverlay();
          p.failCallback();
        }
      },
    }

    this.gridApi.setDatasource(datasource);
  }

  onCellClicked(event: any): void {
    if (event.colDef.field == "preferredLabel") {
      this.modalService.showOrganizationDetails(event.data.code);
    } else if (event.colDef.field == "subOrganizationOf.preferredLabel") {
      this.modalService.showOrganizationDetails(event.data.subOrganizationOf.code);
    } 
  }

  onFilterChanged() {
    this.filterChange$.next();
    // console.log('Filter changed, triggering data reload', this.gridApi.getFilterModel());
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

    localStorage.setItem('orgGridState', JSON.stringify(state));
  }

  private restoreGridState() {
    const savedState = localStorage.getItem('orgGridState');
    if (!savedState) return;

    try {
      const { filterModel, columnState, sortModel } = JSON.parse(savedState);

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
    localStorage.removeItem('orgGridState');

    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      (this.gridApi as any).setSortModel?.(null);
      this.gridApi.applyColumnState({ state: [], applyOrder: true });

      this.gridApi.refreshInfiniteCache?.();
      this.gridApi.refreshServerSide?.({ purge: true });
    }
  }
}

// OLD CODE
// import { Component, inject } from '@angular/core';
// import { Store } from '@ngrx/store';
// import { AgGridAngular } from 'ag-grid-angular';
// import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
// import { map, take } from 'rxjs';
// import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
// import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
// import { ConstService } from 'src/app/shared/services/const.service';
// import { ModalService } from 'src/app/shared/services/modal.service';
// import { OrganizationService } from 'src/app/shared/services/organization.service';
// import { AppState } from 'src/app/shared/state/app.state';
// import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';

// @Component({
//   selector: 'app-foreis',
//   standalone: true,
//   imports: [AgGridAngular, GridLoadingOverlayComponent],
//   templateUrl: './foreis.component.html',
//   styleUrl: './foreis.component.css',
// })
// export class ForeisComponent {
//   constService = inject(ConstService);
//   organizationService = inject(OrganizationService);
//   modalService = inject(ModalService);
//   foreis: IOrganizationList[] = [];

//   store = inject(Store<AppState>);
//   organizations$ = selectOrganizations$;

//   organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
//   organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

//   defaultColDef = this.constService.defaultColDef;
//   colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS;
//   autoSizeStrategy = this.constService.autoSizeStrategy;

//   loadingOverlayComponent = GridLoadingOverlayComponent;
//   loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

//   gridApi: GridApi<IOrganizationList>;

//   onGridReady(params: GridReadyEvent<IOrganizationList>): void {
//     this.gridApi = params.api;
//     this.gridApi.showLoadingOverlay();
//     this.store
//       .select(selectOrganizations$)
//       .pipe(take(1))
//       .subscribe((data) => {
//         this.foreis = data.map((org) => {
//           return {
//             ...org,
//             organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
//             subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
//             subOrganizationOfCode: org.subOrganizationOf
//           };
//         });
//         this.gridApi.hideOverlay();
//       });
//   }

//   onCellClicked(event: any): void {

//     if (event.colDef.field == "preferredLabel") {
//       this.modalService.showOrganizationDetails(event.data.code);
//     } else if (event.colDef.field == "subOrganizationOf") {
//       this.modalService.showOrganizationDetails(event.data.subOrganizationOfCode);
//     } 
//   }
// }
