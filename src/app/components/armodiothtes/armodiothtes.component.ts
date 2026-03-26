import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent,
  IDatasource,
  IGetRowsParams
} from 'ag-grid-community';
import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { RemitService } from 'src/app/shared/services/remit.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Subject, firstValueFrom } from 'rxjs';

export interface IRemitExtended extends IRemit {
  organizationLabel: string;
  organizationUnitLabel: string;
}

@Component({
  selector: 'app-armodiothtes',
  standalone: true,
  imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './armodiothtes.component.html',
  styleUrl: './armodiothtes.component.css',
})
export class ArmodiothtesComponent {
  constService = inject(ConstService);
  remitsService = inject(RemitService);
  modalService = inject(ModalService);
  remits: IRemitExtended[] = [];

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = [
    { field: 'organizationLabel', headerName: 'Φορέας', flex: 1 },
    { field: 'organizationUnitLabel', headerName: 'Μονάδα', flex: 1 },
    { field: 'remitType', headerName: 'Τύπος', flex: 1 },
    {
      field: 'remitText',
      headerName: 'Κείμενο',
      flex: 6,
      cellRenderer: HtmlCellRenderer,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' },
    },
  ];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

  gridApi: GridApi<IRemitExtended>;
  private filterChange$ = new Subject<void>();
  private sortChange$ = new Subject<void>();

  onGridReady(params: GridReadyEvent<IRemitExtended>): void {
    this.gridApi = params.api;

    this.restoreGridState();
    
    const datasource: IDatasource = {
      getRows: async (p: IGetRowsParams) => {

        this.gridApi.showLoadingOverlay();

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

          const transformedRows = response.rows.map((org: IRemitExtended) => ({
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
    if (event.colDef.field == "organizationLabel") {
      this.modalService.showOrganizationDetails(event.data.organizationCode);
    } else if (event.colDef.field == "organizationUnitLabel") {
      this.modalService.showOrganizationUnitDetails(event.data.organizationalUnitCode);
    } else if (event.colDef.field == "remitText") {
      this.modalService.showRemitDetails({organizationCode: event.data.organizationalUnitCode,remitId: event.data["_id"]["$oid"]})
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

    localStorage.setItem('remitGridState', JSON.stringify(state));
  }

  private restoreGridState() {
    const savedState = localStorage.getItem('remitGridState');
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
    localStorage.removeItem('remitGridState');

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
// import { CommonModule, NgIf } from '@angular/common';
// import { Component, OnDestroy, inject } from '@angular/core';
// import { Store } from '@ngrx/store';
// import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
// import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
// import { Subscription, take } from 'rxjs';
// import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
// import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
// import { ConstService } from 'src/app/shared/services/const.service';
// import { RemitService } from 'src/app/shared/services/remit.service';
// import { AppState } from 'src/app/shared/state/app.state';
// import { selectRemits$, selectRemitsLoading$ } from 'src/app/shared/state/remits.state';
// import { selectOrganizationCodeByOrganizationalUnitCode$ } from 'src/app/shared/state/organizational-units.state';
// import { ModalService } from 'src/app/shared/services/modal.service';

// export interface IRemitExtended extends IRemit {
//   organizationLabel: string;
//   organizationUnitLabel: string;
// }

// @Component({
//   selector: 'app-armodiothtes',
//   standalone: true,
//   imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
//   templateUrl: './armodiothtes.component.html',
//   styleUrl: './armodiothtes.component.css',
// })
// export class ArmodiothtesComponent implements OnDestroy {
//   constService = inject(ConstService);
//   remitsService = inject(RemitService);
//   modalService = inject(ModalService);
//   remits: IRemitExtended[] = [];

//   store = inject(Store<AppState>);
//   remits$ = selectRemits$;
//   remitsLoading$ = selectRemitsLoading$;
//   selectOrganizationCodeByOrganizationalUnitCode$ = selectOrganizationCodeByOrganizationalUnitCode$;

//   organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
//   organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;

//   defaultColDef = this.constService.defaultColDef;
//   colDefs: ColDef[] = [
//     { field: 'organizationLabel', headerName: 'Φορέας', flex: 1 },
//     { field: 'organizationUnitLabel', headerName: 'Μονάδα', flex: 1 },
//     { field: 'remitType', headerName: 'Τύπος', flex: 1 },
//     {
//       field: 'remitText',
//       headerName: 'Κείμενο',
//       flex: 6,
//       cellRenderer: HtmlCellRenderer,
//       autoHeight: true,
//       cellStyle: { 'white-space': 'normal' },
//     },
//   ];

//   autoSizeStrategy = this.constService.autoSizeStrategy;

//   loadingOverlayComponent = GridLoadingOverlayComponent;
//   loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

//   gridApi: GridApi<IRemitExtended>;

//   subscriptions: Subscription[] = [];

//   ngOnDestroy(): void {
//     this.subscriptions.forEach((sub) => sub.unsubscribe());
//   }

//   onGridReady(params: GridReadyEvent<IRemitExtended>): void {
//     this.gridApi = params.api;
//     this.gridApi.showLoadingOverlay();
//     this.subscriptions.push(
//       this.store.select(this.remits$).subscribe((data) => {
//         this.remits = data.map((remit) => {
//           const orgUnitCode = remit.organizationalUnitCode;
//           const orgCode =
//             this.constService.ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP.get(orgUnitCode);
//           return {
//             ...remit,
//             organizationLabel: this.organizationCodesMap.get(orgCode),
//             organizationUnitLabel: this.organizationUnitCodesMap.get(remit.organizationalUnitCode),
//             organizationCode: orgCode
//           };
//         });
//         this.gridApi.hideOverlay();
//       }),
//     );
//   }

//   // onRowDoubleClicked(event: any): void {
//   //   this.modalService.showRemitDetails({
//   //     organizationCode: event.data.organizationalUnitCode,
//   //     remitId: event.data["_id"]["$oid"]
//   //   })
//   // }

//    onCellClicked(event: any): void {
//     if (event.colDef.field == "organizationLabel") {
//       this.modalService.showOrganizationDetails(event.data.organizationCode);
//     } else if (event.colDef.field == "organizationUnitLabel") {
//       this.modalService.showOrganizationUnitDetails(event.data.organizationalUnitCode);
//     } else if (event.colDef.field == "remitText") {
//       this.modalService.showRemitDetails({organizationCode: event.data.organizationalUnitCode,remitId: event.data["_id"]["$oid"]})
//     } 
//    }
// }

@Component({
  selector: 'app-html-cell-renderer',
  standalone: true,
  imports: [NgIf],
  template: `
        <div
            [innerHTML]="shortText"
            *ngIf="!showFullText"></div>
        <div
            [innerHTML]="params.value"
            *ngIf="showFullText"></div>
        <button
            class="btn btn-info btn-sm mb-2"
            *ngIf="isLongText"
            (click)="toggleText()">
            {{ showFullText ? 'Σύμπτυξη' : 'Περισσότερα' }}
        </button>
    `,
})
export class HtmlCellRenderer implements ICellRendererAngularComp {
  params: any;
  showFullText = false;
  shortText = '';
  isLongText = false;

  agInit(params: any): void {
    this.params = params;
    if (this.params.value.length > 500) {
      this.shortText = this.params.value.substr(0, 500);
      this.isLongText = true;
    } else {
      this.shortText = this.params.value;
    }
  }

  refresh(params: any): boolean {
    this.params = params;
    if (this.params.value.length > 500) {
      this.shortText = this.params.value.substr(0, 500);
      this.isLongText = true;
    } else {
      this.shortText = this.params.value;
    }
    this.showFullText = false; // Reset the text display state
    return true;
  }

  toggleText(): void {
    this.showFullText = !this.showFullText;
  }
}
