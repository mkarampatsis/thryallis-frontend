import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { IOta } from 'src/app/shared/interfaces/ota/ota.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OtaService } from 'src/app/shared/services/ota.service';

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
  otaService  = inject(OtaService);

  otaDetails: IOta[] = [];

  defaultColDef = this.constOtaService.defaultColDef;
  colDefs: ColDef[] = this.constOtaService.OTA_COL_DEFS;
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

  gridApi: GridApi<IOta[]>;
  showGrid: boolean = false;
  
  onGridReady(params: GridReadyEvent<IOta[]>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    
        this.gridApi.hideOverlay();
    
  }

  onRowSelected(event: any): void {
    this.modalService.otaEdit(event.data, false)
    .subscribe(result => {
      if (result) {
        console.log('Refresh Grid Data', result);
        this.otaService.getAllOta()
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 200) {
            this.getOta();
            // this.gridApi.setRowData(this.otaDetails);
          }
        });
      }
    });
  }

  newOta(){
    this.modalService.otaEdit(null, true)
    .subscribe(result => {
      if (result) {
        console.log('Refresh Grid Data', result);
        this.otaService.getAllOta()
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 200) {
            this.getOta();
            // this.gridApi.setRowData(this.otaDetails);
          }
        });
      }
    })
  }

  getOta(){
    this.otaService.getAllOta()
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 200) {
          this.otaDetails = body;
          console.log('OTA Details:', this.otaDetails);
          if (this.otaDetails.length > 0) {
            // this.gridApi.setRowData(this.otaDetails);
            this.showGrid = true;
          }
        }
      })
  }
}
