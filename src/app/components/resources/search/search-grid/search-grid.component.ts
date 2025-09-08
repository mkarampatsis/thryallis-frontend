import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ISearchGridOutput } from 'src/app/shared/interfaces/search/search.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { map, forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-search-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './search-grid.component.html',
  styleUrl: './search-grid.component.css'
})
export class SearchGridComponent implements OnChanges {
  @Input() data: ISearchGridOutput[] | null;

  searchData: any[];
  constService = inject(ConstService);
  modalService = inject(ModalService);
  legalProvisionService = inject(LegalProvisionService);
  resourceService = inject(ResourcesService)

  loading = false;

  defaultColDef = this.constService.defaultColDef;

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

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      console.log("Data changed:", this.data);
      this.fetchData();
    }
  }

  fetchData() {
    this.loading = true;
    this.resourceService
      .postSearch(this.data)
      .pipe(take(1))
      .subscribe(response => {
        if (response.status === 200) {
          this.searchData = response.body;
          console.log(this.searchData); 
        }
        this.loading = false;
      });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.gridApi.hideOverlay();
  }

  onCellClicked(event: any): void {
    if (event.colDef.field != "organizationScore" && event.colDef.field != "organizationalUnitScore") {
      if (event.colDef.field === 'organizationPreferredLabel') {
        this.modalService.showOrganizationDetails(event.data.organizationCode);
      }
      else if (event.data.organizationalUnitObjectId && event.colDef.field === 'organizationalUnitPreferredLabel') {
        this.modalService.showOrganizationUnitDetails(event.data.organizationalUnitCode)
      } else {
        if (event.data.remitObjectId) {
          this.modalService.showRemitDetails({
            organizationCode: event.data.organizationalUnitCode,
            remitId: event.data.remitObjectId
          })
        }
      }
    }
  }

  onBtnExportCSV() {
    this.loading = true;
    // console.log(this.data)
    if (this.data[0].remitObjectId === "") {
      this.gridApi.exportDataAsCsv();
      this.loading = false;
    } else {
      const observables = this.data.map(doc =>
        this.legalProvisionService
          .getLegalProvisionsByRegulatedRemit(doc.remitObjectId)
          .pipe(
            map(legalProvisionData => {
              // Create a shallow copy of the object to make it mutable
              const mutableDoc = { ...doc };
              mutableDoc["legalProvisionDetails"] = legalProvisionData;
              return mutableDoc;
            })
          )
      );

      // Use forkJoin to handle all the requests simultaneously
      forkJoin(observables).subscribe(
        updatedArray => {
          // Update the original data array if needed
          this.data.length = 0; // Clear original array
          this.data.push(...updatedArray); // Push updated objects back
          //   console.log('Updated data array:', this.data);
          // this.searchService.onExportCSV(this.data);
          this.loading = false;
        },
        error => {
          console.error('Error fetching legal provisions:', error);
        }
      );
    }
  }

  onBtnExportExcel() {
    this.loading = true;
    if (this.data[0].remitObjectId === "") {
      // this.searchService.onExportToExcel(this.data)
      this.loading = false;
    } else {
      const observables = this.data.map(doc =>
        this.legalProvisionService
          .getLegalProvisionsByRegulatedRemit(doc.remitObjectId)
          .pipe(
            map(legalProvisionData => {
              // Create a shallow copy of the object to make it mutable
              const mutableDoc = { ...doc };
              mutableDoc["legalProvisionDetails"] = legalProvisionData;
              return mutableDoc;
            })
          )
      );

      // Use forkJoin to handle all the requests simultaneously
      forkJoin(observables).subscribe(
        updatedArray => {
          // Update the original data array if needed
          this.data.length = 0; // Clear original array
          this.data.push(...updatedArray); // Push updated objects back
          //   console.log('Updated data array:', this.data);
          // this.searchService.onExportToExcel(this.data);
          this.loading = false;
        },
        error => {
          console.error('Error fetching legal provisions:', error);
        }
      );
    }
  }
}

@Component({
  selector: 'app-html-cell-renderer',
  standalone: true,
  imports: [NgIf],
  template: `
        <div :class="emphasis" 
            [innerHTML]="shortText"
            *ngIf="!showFullText"></div>
        <div :class="emphasis"
            [innerHTML]="params.value"
            *ngIf="showFullText"></div>
        <button
            class="btn btn-info btn-sm mb-2"
            *ngIf="isLongText"
            (click)="toggleText()">
            {{ showFullText ? 'Σύμπτυξη' : 'Περισσότερα' }}
        </button>
    `,
  styles: 'em { color: red }'
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