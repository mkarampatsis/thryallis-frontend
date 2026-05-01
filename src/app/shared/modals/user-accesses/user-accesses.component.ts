import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser, IUserRole } from '../../interfaces/auth';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, FirstDataRenderedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AppState } from '../../state/app.state';
import { selectOrganizations$ } from '../../state/organizations.state';
import { ConstService } from '../../services/const.service';
import { GridLoadingOverlayComponent } from '../grid-loading-overlay/grid-loading-overlay.component';
import { take } from 'rxjs';
import { IOrganizationList } from '../../interfaces/organization/organization-list.interface';
import { IForeas } from '../../interfaces/foreas/foreas.interface';
import { selectOrganizationalUnitCodeByOrganizationCode$ } from 'src/app/shared/state/organizational-units.state';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-accesses',
  standalone: true,
  imports: [
    CommonModule, 
    AgGridAngular, 
    GridLoadingOverlayComponent,
    ReactiveFormsModule
  ],
  templateUrl: './user-accesses.component.html',
  styleUrl: './user-accesses.component.css',
})
export class UserAccessesComponent {
  constService = inject(ConstService);
  userService = inject(UserService)
  modalRef: any;
  user: IUser | undefined;
  currentRoles: IUserRole[] | undefined = [];
  roles = this.constService.USER_ROLES;
  
  userForeis: string[] | undefined= [];
  foreis: IOrganizationList[] = [];

  store = inject(Store<AppState>);
  organizations$ = selectOrganizations$;
  selectOrganizationalUnitCodeByOrganizationCode$ = selectOrganizationalUnitCodeByOrganizationCode$

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
  autoSizeStrategy = this.constService.autoSizeStrategy;

  selectedData: IForeas[] = [];

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

  gridApi: GridApi<IOrganizationList>;

  readonly defaultFormValues = {
    role: '',
    active: true,
    foreas: [],
    monades: []
  };

  form = new FormGroup({
    role: new FormControl('', Validators.required),
    active: new FormControl(true, Validators.required),
    foreas: new FormControl([]),
    monades: new FormControl([]),
  });

  ngOnInit() {
    this.userForeis = this.user?.roles.filter(role => role.role == "EDITOR" && role.active).flatMap(r => r.foreas);
    this.currentRoles = this.user?.roles;
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
        this.gridApi.hideOverlay();
        this.gridApi.setRowData(this.foreis);
      });
  }

  onFirstDataRendered(params: FirstDataRenderedEvent): void {
    if (!this.gridApi) return;

    this.gridApi.forEachNode((node) => {
      if (this.userForeis.includes(node.data.code)) {
        node.setSelected(true);
      }
    });
  }

  dismiss() {
    this.modalRef.dismiss();
  }

  onSubmit() {
    this.userService.setUserAccesses(this.user?.email as string, this.currentRoles as IUserRole[])
      .pipe(take(1))
      .subscribe((result) => {
        this.modalRef.dismiss(true);
      });
  }

  onSelectionChanged(event) {
    const selectedNodes = this.gridApi.getSelectedNodes();
    this.selectedData = selectedNodes.map((node: any) => node.data);
  }

  getPreferredLabel(code: string) {
    return this.organizationCodesMap.get(code);
  }

  getMissingRoles(currentRole: string) {
    if (currentRole==="EDITOR"){
      const roles = this.roles.filter(
        r => !this.currentRoles?.some(cr => cr.role === r)
      );
      return [currentRole, ...roles];
    } else {
      return this.roles.filter(
        r => !this.currentRoles?.some(cr => cr.role === r)
      );
    }
  }

  addRole() {
    const newRole = this.form.value as IUserRole;
    if (newRole.role==="EDITOR") {
      
      const {selectedOrganizations, selectedOrganizationalUnits} = this.getEditorAccesses()
      newRole.foreas = selectedOrganizations
      newRole.monades = selectedOrganizationalUnits

      const exist = this.currentRoles?.filter(r => r.role === "EDITOR");
      if (exist) {
        const roles = this.currentRoles?.filter(r => r.role !== "EDITOR");
        this.currentRoles = roles;
      }
    }
    this.currentRoles?.push(newRole)
    this.form.reset(this.defaultFormValues);
  }

  editRole(role: IUserRole) {
    this.form.enable(); 
    this.form.patchValue(role);
  }

  disableRole(role: IUserRole) {
    const roles = this.currentRoles?.map(r =>
      r.role === role.role ? { ...r, active: false } : r
    );
    this.currentRoles = roles;
    this.form.reset(this.defaultFormValues);
  }

  enableRole(role: IUserRole) {
    const roles = this.currentRoles?.map(r =>
      r.role === role.role ? { ...r, active: true } : r
    );
    this.currentRoles = roles;
    this.form.reset(this.defaultFormValues);
  }

  removeRole(role: IUserRole) {
    const roles = this.currentRoles?.filter(r => r.role !== role.role);
    this.currentRoles = roles;
    this.form.reset(this.defaultFormValues);
  }

  getEditorAccesses(){
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedOrganizations = selectedNodes.map((node: any) => node.data['code']);
    let selectedOrganizationalUnits = []
    for (let data of selectedOrganizations) {
      this.store
        .select(this.selectOrganizationalUnitCodeByOrganizationCode$(data))
        .pipe(take(1))
        .subscribe((orgCodes) => {
          selectedOrganizationalUnits = selectedOrganizationalUnits.concat(...orgCodes)
        });
    }

    return { selectedOrganizations, selectedOrganizationalUnits }
  }
}
