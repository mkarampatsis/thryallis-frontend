import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { CellClickedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
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

  facilityData: any[];
  spaceData: any[];
  equipmentData: any[];
  
  constService = inject(ConstService);
  modalService = inject(ModalService);
  legalProvisionService = inject(LegalProvisionService);
  resourceService = inject(ResourcesService)

  loading = false;

  defaultColDef = this.constService.defaultColDef;

  colDefs_Facilities: ColDef[] = [
    { field: 'kaek', headerName: 'ΚΑΕΚ', flex: 1 },
    { field: 'distinctiveNameOfFacility', headerName: 'Διακριτή Ονομασία', flex: 2 },
    { field: 'UseOfFacility', headerName: 'Τρόπος Χρήσης', flex: 2 },
    // { 
    //   field: 'Address',
    //   cellRenderer: (params) => {
    //     let item = '';
    //     const data = params.value;
    //     item = data.street + ',' + data.number + ',' + data.postcode + ',' + data.area + ',' + data.municipality;
    //     return item;
    //   }, 
    //   flex: 1, 
    // },
    { field: 'CoveredPremisesArea', headerName: 'Εμβαδόν', flex: 1 }
  ];

  colDefs_Spaces: ColDef[] = [
    { field: 'spaceName', headerName: 'Χώρος', flex: 1 },
    { field: 'spaceUse', headerName: 'Χρήση', flex: 2 },
    { field: 'spaceArea', headerName: 'Εμβαδόν', flex: 1 },
    { field: 'facility', headerName: 'Ακίνητο', flex: 1 }
  ];

  colDefs_Equipments: ColDef[] = [
    { field: 'kind', headerName: 'Είδος', flex: 1 },
    { field: 'type', headerName: 'Τύπος', flex: 1 },
    { 
      field: 'itemDescription', 
      headerName: 'Χαρακτηριστικά', 
      valueGetter: (params) => {
        if (!params.data.itemDescription) return '';
        return params.data.itemDescription.map(s => s.description + '=' + s.value).join(', ');
      },
      flex: 1,
      filter: true,
    },
    { field: 'spaceWithinFacility', headerName: 'Ακίνητο', flex: 1 },
    { field: 'organizations', headerName: 'Φορέας', flex: 1 }
  ];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApiFacilities: GridApi;
  gridApiSpaces: GridApi;
  gridApiEquipments: GridApi;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
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
          this.facilityData = response.body["facilities"]; 
          this.spaceData = response.body["spaces"]; 
          this.equipmentData = response.body["equipment"]; 
          console.log(response.body); 
        }
        this.loading = false;
      });
  }

  onGridReadyFacilities(params: GridReadyEvent): void {
    this.gridApiFacilities = params.api;
    this.gridApiFacilities.showLoadingOverlay();
    this.gridApiFacilities.hideOverlay();
  }

  onCellFacilityClicked(event: CellClickedEvent): void  {
    console.log(event)
    
    // this.organizationCode = event.data['organizationCode']
    // if (event.colDef.field=="preferredLabel") {
  }

  onGridReadySpaces(params: GridReadyEvent): void {
    this.gridApiSpaces = params.api;
    this.gridApiSpaces.showLoadingOverlay();
    this.gridApiSpaces.hideOverlay();
  }

  onCellSpaceClicked(event: CellClickedEvent): void  {
    console.log(event)
    
    // this.organizationCode = event.data['organizationCode']
    // if (event.colDef.field=="preferredLabel") {
  }

  onGridReadyEquipments(params: GridReadyEvent): void {
    this.gridApiEquipments = params.api;
    this.gridApiEquipments.showLoadingOverlay();
    this.gridApiEquipments.hideOverlay();
  }

  onCellEquipmentClicked(event: CellClickedEvent): void  {
    console.log(event)
    
    // this.organizationCode = event.data['organizationCode']
    // if (event.colDef.field=="preferredLabel") {
  }

  onBtnExportCSV() {
    this.loading = true;
    // console.log(this.data)
    if (this.data[0].remitObjectId === "") {
      this.gridApiFacilities.exportDataAsCsv();
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