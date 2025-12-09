import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { OtaService } from 'src/app/shared/services/ota.service';
import { take, map, forkJoin } from 'rxjs';
import {ISearchOTA_Input, ISearchOTA_Output } from 'src/app/shared/interfaces/ota/searchOta.interface';

@Component({
  selector: 'app-search-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './search-grid.component.html',
  styleUrl: './search-grid.component.css'
})
export class SearchGridComponent {
  @Input() data: ISearchOTA_Input[] | null;
  
  constOtaService = inject(ConstOtaService);
  modalService = inject(ModalService);
  otaService = inject(OtaService)

  loading = false;
  elasticData:ISearchOTA_Output[] = [];

  defaultColDef = this.constOtaService.defaultColDef;

  colDefs: ColDef[] = [
    { field: 'remitCompetence', headerName: 'Φορέας άσκησης', flex: 1 },
    { field: 'remitType', headerName: 'Τύπος', flex: 2},
    { field: 'remitLocalOrGlobal', headerName:"Αυτοδιοικητική Αρμοδιότητα", flex: 1 },
    { field: 'publicPolicyAgency_organization', headerName: 'Φορέας Δημόσιας Πολιτικής', flex: 1 },
    { field: 'publicPolicyAgency_organizationType', headerName: 'Τύπος Φορέα Δημόσιας Πολιτικής', flex: 1 },
    {
      field: 'remitText',
      headerName: 'Αρμοδιότητα',
      flex: 4,
      cellRenderer: HtmlCellRenderer,
      autoHeight: true,
      cellStyle: { 'white-space': 'normal' }
    },
  ];
  
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.fetchData();
    }
  }

  fetchData() {
    this.loading = true;
    this.otaService
    .postSearch(this.data)
    .pipe(take(1))
    .subscribe(response => {
      if (response.status === 200) {
        this.elasticData = response.body
        console.log("ElasticData", this.elasticData);
      } 
      this.loading = false;
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.gridApi.hideOverlay();
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent) {
    this.otaService.getOtaByID(event.data.object_id).pipe(
      take(1),
      map(response => response.body)
    ).subscribe(otaDetails => {
      if (otaDetails) {
        this.modalService.showOtaDetails(otaDetails);
      }
    });
  }

  onBtnExportExcel() {
    this.otaService.onExportToExcel(this.elasticData);
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
