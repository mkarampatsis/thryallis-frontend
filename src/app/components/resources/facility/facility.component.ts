import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { AgGridNoRowsOverlayComponent } from 'src/app/shared/components/ag-grid-no-rows-overlay/ag-grid-no-rows-overlay.component';

import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { UserService } from 'src/app/shared/services/user.service';

import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
// import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';

import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { IFacility } from 'src/app/shared/interfaces/facility/facility';

import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { take } from 'rxjs';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [
    CommonModule, 
    AgGridAngular, 
    AgGridNoRowsOverlayComponent, 
    ReactiveFormsModule
  ],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.css'
})
export class FacilityComponent {
  constFacilityService = inject(ConstFacilityService);
  constService = inject(ConstService);
  userService = inject(UserService);

  organizationalUnits: IOrganizationUnitList[] = [];
  gridOrganizationalUnits: IOrganizationUnitList[] = [];

  store = inject(Store<AppState>);
  organizationalUits$ = selectOrganizationalUnits$;

  facilities: IFacility[] | null = [];
  noRowsOverlayComponent: any = AgGridNoRowsOverlayComponent;

  loading = false;
  showForm = false;

  USE_OF_FACILITY = this.constFacilityService.USE_OF_FACILITY;
  FLOORPLANS = this.constFacilityService.FLOORPLANS;

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
  organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

  defaultColDef = this.constFacilityService.defaultColDef;
  organizationalUnitsColDefs: ColDef[] = this.constFacilityService.ORGANIZATIONAL_UNITS_COL_DEFS
    ;
  autoSizeStrategy = this.constFacilityService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;

  form = new FormGroup({
    kaek: new FormControl('', Validators.required),
    belongsTo: new FormControl('', Validators.required),
    distinctiveNameOfFacility: new FormControl('', Validators.required),
    useOfFacility: new FormControl('', Validators.required),
    uniqueUserOfFacility: new FormControl(''),
    coveredPremisesArea: new FormControl('', Validators.required),
    floorsOrLevels: new FormControl('', Validators.required),
    floorPlans: new FormArray([
      new FormGroup({
        level: new FormControl('', Validators.required),
        num: new FormControl('', Validators.required),
        floorArea: new FormControl('', Validators.required),
        floorPlan: new FormControl('', Validators.required),
      })
    ]),
    addressOfFacility: new FormGroup({
      street: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      postcode: new FormControl('', Validators.required),
      area: new FormControl('', Validators.required),
      municipality: new FormControl('', Validators.required),
      geographicRegion: new FormControl('', Validators.required),
      country: new FormControl('ΕΛΛΑΣ', Validators.required),
    }),
    spaces: new FormArray([
      new FormGroup({
        spaceName: new FormControl('', Validators.required),
        spaceUse: new FormControl('', Validators.required),
        spaceUseTree: new FormControl('', Validators.required),
        spaceArea: new FormControl('', Validators.required),
        spaceLength: new FormControl('', Validators.required),
        spaceWidth: new FormControl('', Validators.required),
        entrances: new FormControl('', Validators.required),
        windows: new FormControl('', Validators.required),
        floor_level: new FormControl('', Validators.required)
      })
    ]),
    finalized: new FormControl(false, Validators.required),
  });

  floorPlans = this.form.get('floorPlans') as FormArray;

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.store
      .select(this.organizationalUits$)
      .pipe(take(1))
      .subscribe((data) => {
        this.organizationalUnits = data.map((org) => {
          return {
            ...org,
            organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
            organization: this.organizationCodesMap.get(org.organizationCode),
            subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
          };
        });
        this.gridOrganizationalUnits = this.organizationalUnits;
        this.gridApi.hideOverlay();
      });
  }
  allFacilities() {
    this.gridOrganizationalUnits = this.organizationalUnits;
  }

  myFacilities() {
    const myForeis = this.userService.user().roles.find(r => r.role === 'FACILITY_EDITOR')?.foreas ?? [];
    this.gridOrganizationalUnits = this.organizationalUnits.filter(f => myForeis.includes(f.organizationCode))
  }

  onCellClicked(event: CellClickedEvent): void {
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;

    if (action === 'info') {
      this.showFacility(event.data);
    } else if (action === 'edit') {
      this.editFacility(event.data);
    } else if (action === 'delete') {
      this.deleteFacility(event.data)
    }
  }

  editFacility(data: IOrganizationList) {
    console.log("Edit", data)
    this.showForm = true;
  }

  showFacility(data: IOrganizationList) {
    console.log("Show", data)
  }

  deleteFacility(data: IOrganizationList) {
    console.log("Delete", data)
  }

  hasFacilityAdminRole() {
    return this.userService.hasFacilityAdminRole()
  }

  hasFacilityEditorRole() {
    return this.userService.hasFacilityEditorRole()
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