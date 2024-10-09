import { Component, OnInit, inject } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { GridApi, GridReadyEvent } from 'ag-grid-community';

import { IUser } from 'src/app/shared/interfaces/auth';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
    selector: 'app-user-admin',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './user-admin.component.html',
    styleUrl: './user-admin.component.css',
})
export class UserAdminComponent implements OnInit {
    userService = inject(UserService);
    constService = inject(ConstService);
    modalService = inject(ModalService);

    users: IUser[] = [];
    defaultColDef = this.constService.defaultColDef;
    colDefs = this.constService.USERS_COL_DEFS;

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση προσβάσεων...' };

    gridApi: GridApi<IUser>;

    ngOnInit(): void {}

    onGridReady(params: GridReadyEvent<IUser>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.userService.getAllUsers().subscribe((users) => {
            this.users = users;
            this.gridApi.hideOverlay();
        });
    }

    onRowDoubleClicked(event: any): void {
        console.log(event);
        this.modalService.userAccesses(event.data);
    }
}
