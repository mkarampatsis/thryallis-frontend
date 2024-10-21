import { Component, inject, Input } from '@angular/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ISearchGrid } from 'src/app/shared/interfaces/search/search.interface';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-search-grid',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './search-grid.component.html',
  styleUrl: './search-grid.component.css'
})
export class SearchGridComponent {
    @Input() data: ISearchGrid[] | null;
    
    constService = inject(ConstService);
    modalService = inject(ModalService);

    defaultColDef = this.constService.defaultColDef;
    colDefs = this.constService.SEARCH_COL_DEFS;

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

    gridApi: GridApi;

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.gridApi.hideOverlay();
    }

    onRowDoubleClicked(event: any): void {
        console.log(event.data);
        this.modalService.showSearchDetails(event.data);
    }
}
