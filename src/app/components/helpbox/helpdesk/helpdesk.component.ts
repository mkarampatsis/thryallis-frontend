import { Component, inject, effect } from '@angular/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ColDef } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { IHelpbox } from 'src/app/shared/interfaces/helpbox/helpbox.interface';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-helpdesk',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './helpdesk.component.html',
  styleUrl: './helpdesk.component.css'
})
export class HelpdeskComponent {
    modalService = inject(ModalService);
    constService = inject(ConstService);
    helpboxService = inject(HelpboxService);
    userService = inject(UserService);

    userEmail = this.userService.user().email

    helpbox: IHelpbox[] = [];

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = [
        { field: 'questionTitle', headerName: 'Τίτλος', flex:1 },
        { field: 'email', headerName: 'Χρήστης', flex:1 },
        { field: 'firstName', headerName: 'Όνομα', flex:1 },
        { field: 'lastName', headerName: 'Επίθετο', flex:1 },
        {
            field: 'organizations',
            headerName: 'Φορείς',
            cellRenderer: (params) => {
                const organizationPreferedLabel = [];
                params.value.forEach((data) => {
                    organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data));
                });
                return organizationPreferedLabel.join(', ');
            }, 
            flex:1
        },
        // { 
        //     field: 'when.$date', 
        //     headerName: 'Ημερομηνία', 
        //     cellRenderer: function (params) {
        //         return (new Date(params.value)).toLocaleDateString();
        //     }
        //     , flex:1 
        // },
        { field: 'toWhom', headerName: 'Υπεύθυνος', flex:1},
        { 
            field: 'questions', 
            headerName: 'Απάντηση', 
            cellRenderer: function (params) {
                let checker = params.value.every(value => value.answered === true);
                // console.log(checker);
                // return params.value ? "Απαντήθηκε" : 'Εκκρεμεί';
                return checker ? "Απαντήθηκε ("+params.value.length+")" : "Εκκρεμεί ("+params.value.length+")";
            },
            cellStyle: params => {
                let checker = params.value.every(value => value.answered === true);
                // if (params.value) {
                if (checker) {
                    return {color: 'green'};
                } else {
                    return {color: 'red'};
                }
            }, 
            flex:1
        },
        { 
            field: 'finalized', 
            headerName: 'Συνομιλία', 
            cellRenderer: function (params) {
                return params.value ? "Ολοκληρώθηκε" : 'Ανοιχτή';
            },
            cellStyle: params => {
                if (params.value) {
                    return {color: 'green'};
                } else {
                    return {color: 'red'};
                }
            }, 
            flex:1
        },
    ];

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση ερωτημάτων...' };

    gridApi: GridApi<IHelpbox>;

    constructor() {
        effect(
            () => {
                if (this.helpboxService.helpboxNeedUpdate()){
                    this.loadData();
                }
                this.helpboxService.helpboxNeedUpdate.set(false)
            },
            { allowSignalWrites: true }
        );
    }

    onGridReady(params: GridReadyEvent<IHelpbox>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.loadData();
    }

    loadData(){
        if (this.userService.hasEditorRole()) {
            this.helpboxService.getHelpboxByEmail(this.userEmail).subscribe((helpbox) => {
                this.helpbox = helpbox;
                this.gridApi.hideOverlay();
            });
        } else {
            this.helpboxService.getAllHelpbox().subscribe((helpbox) => {
                this.helpbox = helpbox;
                this.gridApi.hideOverlay();
            });
        }
    }

    onRowClicked(event: any): void {
        this.modalService.showHelpboxAnswer(event.data._id.$oid);
    }

}
