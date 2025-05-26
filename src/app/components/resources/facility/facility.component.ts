import { Component, inject } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { IFacility } from 'src/app/shared/interfaces/facility/facility';
import { AgGridNoRowsOverlayComponent } from 'src/app/shared/components/ag-grid-no-rows-overlay/ag-grid-no-rows-overlay.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
import { take } from 'rxjs';
import { UserService } from 'src/app/shared/services/user.service';


@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [AgGridAngular, AgGridNoRowsOverlayComponent],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.css'
})
export class FacilityComponent {
  constFacilityService = inject(ConstFacilityService);
  constService = inject(ConstService);
  userService = inject(UserService);

  foreis: IOrganizationList[] = [];
  gridForeis: IOrganizationList[] = [];

  store = inject(Store<AppState>);
  organizations$ = selectOrganizations$;

  facilities: IFacility[] | null = [];
  noRowsOverlayComponent: any = AgGridNoRowsOverlayComponent;

  loading = false;

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;
  
  defaultColDef = this.constFacilityService.defaultColDef;
  foreisColDefs: ColDef[] = this.constFacilityService.ORGANIZATIONS_COL_DEFS;

  facilityColDefs: ColDef[] = [
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

  constructor() {
    this.loading = false
  }

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.store
      .select(selectOrganizations$)
      .pipe(take(1))
      .subscribe((data) => {
        this.foreis = data.map((org) => {
          return {
            ...org,
            organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
            subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
          };
        });
        this.gridForeis = this.foreis;
        this.gridApi.hideOverlay();
      });
  }

  // onGridReady(params: GridReadyEvent): void {
  //   this.gridApi = params.api;
  //   // this.gridApi.showLoadingOverlay();
  //   // this.gridApi.hideOverlay();
  // }

  allFacilities() {
    this.gridForeis = this.foreis;
  }

  myFacilities() {
    const myForeis = this.userService.user().roles.find(r => r.role === 'FACILITY_EDITOR')?.foreas ?? [];
    this.gridForeis = this.foreis.filter(f => myForeis.includes(f.code))
  }

  onCellClicked(event: CellClickedEvent): void {
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;
  
    if (action === 'info') {
      this.showFacility(event.data);
    } else if (action === 'edit') {
      this.editFacility(event.data);
    } else if (action ==='delete'){
      this.deleteFacility(event.data)
    }
  }

  editFacility(data:IOrganizationList) {
    console.log("Edit", data)
  }

  showFacility(data:IOrganizationList) {
    console.log("Show", data)
  }

  deleteFacility(data:IOrganizationList) {
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