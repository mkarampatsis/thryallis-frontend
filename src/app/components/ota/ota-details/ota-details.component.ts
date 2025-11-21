import { Component, inject, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { take } from 'rxjs';
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
export class OtaDetailsComponent implements OnInit {
  constOtaService = inject(ConstOtaService);
  modalService = inject(ModalService);
  otaService  = inject(OtaService);

  otaDetails: IOta[] = [];

  defaultColDef = this.constOtaService.defaultColDef;
  colDefs: ColDef[] = this.constOtaService.OTA_DETAILS_COL_DEFS;
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

  gridApi: GridApi<IOta>;
  loading: boolean = false;

  organizationUnitTypesMap = this.constOtaService.ORGANIZATION_UNIT_TYPES_MAP;
  
  ngOnInit() {
    this.getOta();
  } 

  onGridReady(params: GridReadyEvent<IOta>): void {
    this.gridApi = params.api;
    if (this.otaDetails.length > 0) {
      this.gridApi.hideOverlay();
    } else {
      this.gridApi.showNoRowsOverlay();
    }
  }

  onRowSelected(event: any): void {
    this.modalService.otaEdit(event.data, false)
    .pipe(take(1))
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
      console.log('OTA Edit Modal Result:', result);
      if (result) {
        console.log('Refresh Grid Data', result);
        this.otaService.getAllOta()
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 200) {
            this.getOta();
          }
        });
      }
    })
  }

  getOta(){
    this.loading = true;
    setTimeout(() => {
      console.log('Show Loading Overlay1');
      if (this.gridApi) {
        console.log('Show Loading Overlay2');
        this.gridApi.showLoadingOverlay();
      }
    });

    this.otaService.getAllOta()
    .subscribe({
      next: (response) => {
        const body = response.body;
        const status = response.status;

        if (status === 200) {
          this.otaDetails = body;
          this.loading = false;
        }

        if (this.gridApi) {
          console.log('Show Loading Overlay3');
          if (this.otaDetails.length > 0) {
            this.gridApi.hideOverlay();
          } else {
            this.gridApi.showNoRowsOverlay();
          }
        }
      },
      error: () => {
        if (this.gridApi) {
          this.gridApi.showNoRowsOverlay();
        }
      },
    });
  }
}
