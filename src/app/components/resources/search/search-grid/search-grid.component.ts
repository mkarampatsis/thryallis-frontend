import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { CellClickedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ISearchGridOutput } from 'src/app/shared/interfaces/search/search.interface';
import { IElasticResources, IEquipmentElastic, ISpaceElastic } from 'src/app/shared/interfaces/search/search-resources.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { take } from 'rxjs';



@Component({
  selector: 'app-search-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './search-grid.component.html',
  styleUrl: './search-grid.component.css'
})
export class SearchGridComponent implements OnChanges {
  @Input() data: ISearchGridOutput[] | null;

  constService = inject(ConstService);
  modalService = inject(ModalService);
  legalProvisionService = inject(LegalProvisionService);
  resourceService = inject(ResourcesService)

  elasticData: IElasticResources = {
    facilities: [],
    spaces: [],
    equipment: []
  };

  loading = false;

  defaultColDef = this.constService.defaultColDef;

  colDefs_Facilities: ColDef[] = [
    { field: 'organization', headerName: 'Φορέας Χρήσης', flex: 1 },
    { field: 'kaek', headerName: 'ΚΑΕΚ', flex: 1 },
    { field: 'distinctiveNameOfFacility', headerName: 'Διακριτή Ονομασία', flex: 1 },
    { field: 'useOfFacility', headerName: 'Τρόπος Χρήσης', flex: 1 },
    { field: 'addressOfFacility', headerName: 'Διεύθυνση', flex: 1 },
  ];

  colDefs_Spaces: ColDef[] = [
    { field: 'organization', headerName: 'Φορέας Χρήσης', flex: 1 },
    { field: 'spaceName', headerName: 'Χώρος', flex: 1 },
    { field: 'spaceUse', headerName: 'Χρήση', flex: 2 },
    { field: 'spaceArea', headerName: 'Εμβαδόν', flex: .5 },
    { field: 'addressOfFacility', headerName: 'Ακίνητο', flex: 2 }
  ];

  colDefs_Equipments: ColDef[] = [
    { field: 'organization', headerName: 'Φορέας Χρήσης', flex: 1 },
    { field: 'kind', headerName: 'Είδος', flex: 1 },
    { field: 'type', headerName: 'Τύπος', flex: 1 },
    { 
      field: 'itemDescription', 
      headerName: 'Χαρακτηριστικά', 
      flex: 2,
      filter: true,
    },
    { 
      field: 'spaces', 
      headerName: 'Χώρος',
      valueGetter: (params) => {
        if (!params.data.spaces) return '';
        return params.data.spaces.map(s => s.spaceName).join(', ');
      }, 
      flex: 1 
    },
    { 
      field: 'spaceWithinFacility', 
      headerName: 'Ακίνητο',
      valueGetter: (params) => {
        if (!params.data.spaces) return '';
        return params.data.spaces.map(s => s.addressOfFacility).join(', ');
      },  
      flex: 2 
    },
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
    // console.log(this.data);
    this.resourceService
    .postSearch(this.data)
    .pipe(take(1))
    .subscribe(response => {
      if (response.status === 200) {
        this.elasticData = response.body
        this.elasticData.spaces = this.enrichedSpaces(this.elasticData);
        this.elasticData.equipment = this.enrichedEquipments(this.elasticData);
        console.log(this.elasticData); 
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
    const code = event.data['object_id'];
    this.modalService.showResourcesDetails(code);

    // if (event.colDef.field=="preferredLabel") {
  }

  onGridReadySpaces(params: GridReadyEvent): void {
    this.gridApiSpaces = params.api;
    this.gridApiSpaces.showLoadingOverlay();
    this.gridApiSpaces.hideOverlay();
  }

  onCellSpaceClicked(event: CellClickedEvent): void  {
    const code = event.data['object_id'];
    this.modalService.showResourcesSpaceDetails(code);
    // if (event.colDef.field=="preferredLabel") {
  }

  onGridReadyEquipments(params: GridReadyEvent): void {
    this.gridApiEquipments = params.api;
    this.gridApiEquipments.showLoadingOverlay();
    this.gridApiEquipments.hideOverlay();
  }

  onCellEquipmentClicked(event: CellClickedEvent): void  {
    console.log(event.data)
    const code = event.data['object_id'];
    this.modalService.showResourcesEquipemntDetails(code);
    // if (event.colDef.field=="preferredLabel") {
  }

  onBtnExportExcel() {
    this.resourceService.onExportToExcelSearch(this.elasticData);
  }

  enrichedSpaces(data: IElasticResources): ISpaceElastic[]{ 
    return data.spaces.map(space => {
      const facility = data.facilities.find(f => f.object_id === space.facilityId);
      if (facility) {
        return {
          ...space,
          addressOfFacility: facility.addressOfFacility,
          distinctiveNameOfFacility: facility.distinctiveNameOfFacility,
          kaek: facility.kaek
        };
      }
      return space;
    });
  }

  enrichedEquipments(data: IElasticResources): IEquipmentElastic[]{ 
    return data.equipment.map(eq => {
      const relatedSpaces = eq.spaceWithinFacility
        .map(spaceId => data.spaces.find(sp => sp.object_id === spaceId))
        .filter(Boolean); 

      return {
        ...eq,
        spaces: relatedSpaces.map(sp => ({
          spaceName: sp!.spaceName,
          addressOfFacility: sp!.addressOfFacility,
          facilityId: sp!.facilityId
        }))
      }
    });
  }


}