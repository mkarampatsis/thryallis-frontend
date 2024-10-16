import { Component, inject, Input } from '@angular/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { Organization } from 'src/app/shared/interfaces/search/search.interface';

@Component({
  selector: 'app-organization-grid',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './organization-grid.component.html',
  styleUrl: './organization-grid.component.css'
})
export class OrganizationGridComponent {
    @Input() data: Organization[] | null;
    constService = inject(ConstService);

    defaultColDef = this.constService.defaultColDef;
    colDefs = this.constService.SEARCH_COL_DEFS;

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

    gridApi: GridApi;

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        // this.gridApi.showLoadingOverlay();
        // this.gridApi.hideOverlay();
    }

    onRowDoubleClicked(event: any): void {
        console.log(event);
        // this.modalService.userAccesses(event.data);
    }
}
