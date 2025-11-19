import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { IOta } from 'src/app/shared/interfaces/ota/ota.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-ota-details',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './ota-details.component.html',
  styleUrl: './ota-details.component.css'
})
export class OtaDetailsComponent {
  constOtaService = inject(ConstOtaService);
  modalService = inject(ModalService);

  otaDetails: IOta[] = [];

  defaultColDef = this.constOtaService.defaultColDef;
  colDefs: ColDef[] = this.constOtaService.OTA_COL_DEFS;
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

  gridApi: GridApi<IOta[]>;

  onGridReady(params: GridReadyEvent<IOta[]>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    
        this.gridApi.hideOverlay();
    
  }

  onRowSelected(event: any): void {
    this.modalService.otaEdit(event.data, false);
  }
}
