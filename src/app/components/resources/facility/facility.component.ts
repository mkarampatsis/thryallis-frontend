import { Component, inject } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { IFacility } from 'src/app/shared/interfaces/facility/facility';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.css'
})
export class FacilityComponent {
  constFacilityService = inject(ConstFacilityService);

  facilities: IFacility[] = [];
  loading = false;

  defaultColDef = this.constFacilityService.defaultColDef;
  colDefs: ColDef[] = [
    { field: 'organizationCode', headerName: 'Κωδ. Φορέα', flex: 1, hide: true },
    {
      field: 'organizationPreferredLabel',
      headerName: 'Φορέας',
      valueFormatter: params => params.value.toUpperCase(),
      flex: 2
    },
    { field: 'organizationObjectId', flex: 1, hide: true },
    { field: 'organizationScore', headerName: 'Βαθ. Φορέα', flex: 1 },

    { field: 'organizationalUnitCode', headerName: 'Κωδ. Μονάδας', flex: 1, hide: true },
    {
      field: 'organizationalUnitPreferredLabel',
      headerName: 'Μονάδα',
      valueFormatter: params => params.value.toUpperCase(),
      flex: 2
    },
    { field: 'organizationalUnitObjectId', flex: 1, hide: true },

    {
      field: 'remitText',
      headerName: 'Αρμοδιότητα',
      flex: 4,
      cellRenderer: HtmlCellRenderer,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' }
    },
    { field: 'remitObjectId', flex: 1, hide: true },

    { field: 'organizationalUnitScore', headerName: 'Βαθ. Μοναδ./Αρμοδ.', flex: 1, sort: 'desc' }
  ];

  autoSizeStrategy = this.constFacilityService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.gridApi.hideOverlay();
  }

  onCellClicked(event: any): void {
    console.log(event)
  }
}

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