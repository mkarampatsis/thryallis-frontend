import { Component,inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LogDataService } from 'src/app/shared/services/log-data.service';

@Component({
  selector: 'app-log-data',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './log-data.component.html',
  styleUrl: './log-data.component.css'
})
export class LogDataComponent {
    constService = inject(ConstService);
    modalService = inject(ModalService);
    logDataService = inject(LogDataService);

    foreis: Observable<IOrganizationList>

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS;
    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση φορέων...' };

    gridApi: GridApi<IOrganizationList>;

    onGridReady(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.logDataService.createOrganizationGrid()
        this.foreis.subscribe(data => {

        })
        console.log(">>>>", this.foreis);
        this.gridApi.hideOverlay();
        // this.store
        //     .select(selectOrganizations$)
        //     .pipe(take(1))
        //     .subscribe((data) => {
        //         this.userService.getAllUsers().subscribe((users) => {
        //             this.users = users.map((user) => {
        //                 // Filter editor roles
        //                 const editorRoles = user.roles.filter((role) => role.role === "EDITOR");
        //                 if (editorRoles.length > 0) {
        //                   return {
        //                     email: user.email,
        //                     foreis: editorRoles.flatMap((role) => role.foreas),
        //                   };
        //                 }
        //                 return null; // Ignore users without editor roles
        //               })
        //               .filter((entry) => entry !== null); // Remove null entries

        //             console.log(this.users);
        //             this.foreis = data.map((org) => {
        //                 return {
        //                     ...org,
        //                     organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
        //                     subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
        //                 };
        //             });

        //         });
                
        //         this.gridApi.hideOverlay();
        //     });
    }

    onRowDoubleClicked(event: any): void {
        // console.log(event);
        this.modalService.showOrganizationDetails(event.data.code);
    }
}
