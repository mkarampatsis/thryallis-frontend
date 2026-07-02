import { CommonModule} from '@angular/common';
import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-armodiothtes',
  standalone: true,
  imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent, ReactiveFormsModule],
  templateUrl: './armodiothtes.component.html',
  styleUrl: './armodiothtes.component.css',
})
export class ArmodiothtesComponent {
  constService = inject(ConstService);
  remitsService = inject(RemitService);
  modalService = inject(ModalService);
  remits: IRemit[] = [];
  
  gridContext = {
    searchTerm: ''
  };

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = [];
  
  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

  gridApi!: GridApi<IRemit>;
  private filterChange$ = new Subject<void>();
  private sortChange$ = new Subject<void>();
  private showCheckboxes = false;

  form = new FormGroup({
    active: new FormControl(true),
    inactive: new FormControl(false),
    unassigned: new FormControl(false),
  });

  ngOnInit() {
    this.colDefs = this.constService.REMITS_COL_DEFS.map((col, index) => {
      if (index === 0 && !this.showCheckboxes) {
        return { ...col, hide: true } as ColDef;
      }
      return col as ColDef;
    }) as ColDef[];
  }

  onGridReady(params: GridReadyEvent<IRemit>): void {

    this.gridApi = params.api;

    this.restoreGridState();
    
    const datasource: IDatasource = {
      getRows: async (p: IGetRowsParams) => {

        // console.log("Form>>>>",this.form.value);
        this.gridApi.showLoadingOverlay();

        const page = p.startRow / 100 + 1;
        const pageSize = 100;
        const status = this.form.getRawValue();

        try {
          const response = await firstValueFrom(
            this.remitsService
              .getAllRemitsPagination(
                page,
                pageSize,
                p.filterModel,
                p.sortModel,
                status
              )
          );

          this.remits = response.rows.map((remit) => {
            return {
              ...remit,
            };
          });
          
          // console.log("Fetched remits>>:", this.remits);
          this.gridApi.hideOverlay();
          p.successCallback(this.remits, response.total);
          // console.log("REMITS", this.remits)
        } catch (err) {
          // console.error('Error fetching data:', err);
          this.gridApi.showNoRowsOverlay();
          p.failCallback();
        }
      },
    }
    this.gridApi.setGridOption('datasource',datasource);
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
    this.gridContext.searchTerm = this.gridApi.getFilterModel()['remitText']?.filter || '';
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
    this.form.reset({ active: true, inactive: false, unassigned: false });
    localStorage.removeItem('remitGridState');

    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      (this.gridApi as any).setSortModel?.(null);
      this.gridApi.applyColumnState({ state: [], applyOrder: true });

      this.gridApi.refreshInfiniteCache?.();
      this.gridApi.refreshServerSide?.({ purge: true });
    }
  }

  onFormValueChange(){
    // console.log("Checkbox changed:", this.form.value);
    this.gridApi.refreshInfiniteCache?.();
  }
}