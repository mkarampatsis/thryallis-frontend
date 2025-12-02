import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { take } from 'rxjs';
import { IOta } from 'src/app/shared/interfaces/ota/ota.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OtaService } from 'src/app/shared/services/ota.service';

import { OtaActsActionsComponent } from 'src/app/shared/components/ota-acts-actions/ota-acts-actions.component';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-ota-details',
  standalone: true,
  imports: [CommonModule,AgGridAngular,GridLoadingOverlayComponent],
  templateUrl: './ota-details.component.html',
  styleUrl: './ota-details.component.css'
})
export class OtaDetailsComponent implements OnInit {
  constOtaService = inject(ConstOtaService);
  modalService = inject(ModalService);
  otaService  = inject(OtaService);
  userService = inject(UserService);

  otaDetails: IOta[] = [];

  defaultColDef = this.constOtaService.defaultColDef;
  colDefs: ColDef[] = [
    { 
      field: 'remitText', 
      headerName: 'Αρμοδιότητα', 
      flex: 1,
      cellRenderer: HtmlCellRenderer,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' },
    },
    { field: 'remitLocalOrGlobal', headerName: 'Αυτοδιοικητική/Κρατική', flex: 1 },
    { field: 'remitType', headerName: 'Τύπος Αρμοδιότητας', flex: 0.5 },
    { field: 'remitCompetence', headerName: 'Φορέας Άσκησης', flex: 0.5 },
    { field: 'publicPolicyAgency.organization', headerName: 'Φορέας Δημόσιας Πολιτικής', flex: 1 },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες',
      cellRenderer: OtaActsActionsComponent,
      filter: false,
      sortable: false,
      floatingFilter: false,
      flex: 0.5,
      resizable: false,
    },
  ];
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

  gridApi: GridApi<IOta>;
  loading: boolean = false;

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

  // onRowSelected(event: any): void {
  //   console.log('Row selected:', event.data);
  //   this.modalService.showOtaDetails(event.data);
  // }

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

  hasOtaAdminRole() {
    return this.userService.hasOtaAdminRole()
  }

  hasOtaEditorRole() {
    return this.userService.hasOtaEditorRole()
  }
}

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