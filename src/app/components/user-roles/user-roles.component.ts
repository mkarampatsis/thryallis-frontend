import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/shared/services/auth.service';
import { IUser, IUserRole } from 'src/app/shared/interfaces/auth';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  RowSelectedEvent, 
} from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.css'
})
export class UserRolesComponent {
  constService = inject(ConstService);
  authService = inject(AuthService);
  
  user = this.authService.user;
  roles: IUserRole[] = []
  
  defaultColDef = this.constService.defaultColDef;
  autoSizeStrategy = this.constService.autoSizeStrategy;
  
  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση ρόλων...' };

  gridApi!: GridApi<IUserRole>;

  colDefs: ColDef<IUserRole>[] = [
    {
      colId: 'select',
      checkboxSelection: true,
      headerCheckboxSelection: false,
      width: 60,
    },

    {
      field: 'role',
      headerName: 'Ρόλος',
      flex: 1,
    },

    {
      field: 'active',
      headerName: 'Ενεργός',
      flex: 1,
      valueFormatter: (params) => params.value ? 'Ναι' : 'Όχι',
    },

    {
      field: 'foreas',
      headerName: 'Φορείς',
      flex: 2,
      valueGetter: (params) => (params.data?.foreas ?? []).join(', ')
    }
  ];

  constructor() {
    effect(() => {
      const user = this.authService.user(); // read the signal

      if (user) {
        this.roles = this.loadRolesFromToken().filter(r => r.role && r.active);
      }
    });
  }

  onGridReady(params: GridReadyEvent<IUserRole>) {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();

    if (this.roles.length > 0) {
      this.gridApi.setGridOption('rowData', this.roles);
      this.gridApi.hideOverlay();
    }
  }

  loadRolesFromToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];

    const decoded = jwtDecode<IUser>(token);
    return decoded.roles ?? [];
  }

  onRoleSelected(event: RowSelectedEvent<IUserRole>) {
    const role = event.node.isSelected() ? event.data : undefined;
    if (!role) return;

    this.handleRoleSelection(role);
  }

  handleRoleSelection(role: IUserRole) {
    this.authService.user.update((currentUser) => {
      const user = currentUser as IUser;

      return {
        ...user,
        roles: [role]
      } as IUser;
    });
  }

  resetRoles() {
    const allRoles = this.loadRolesFromToken();

    this.authService.user.update((currentUser) => {
      const user = currentUser as IUser;

      return {
        ...user,
        roles: allRoles
      } as IUser;
    });

    // if (this.gridApi) {
    //   this.gridApi.setGridOption('rowData', allRoles);
    // }
  }
}


