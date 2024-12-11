import { Component, inject } from '@angular/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ColDef } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { IHelpbox } from 'src/app/shared/interfaces/helpbox/helpbox.interface';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { ConstService } from 'src/app/shared/services/const.service';

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

    helpbox: IHelpbox[] = [];

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = [
        { field: 'questionTitle', headerName: 'Τίτλος' },
        { field: 'email', headerName: 'Χρήστης' },
        { field: 'firstName', headerName: 'Όνομσ' },
        { field: 'lastName', headerName: 'Επίθετο' },
        {
            field: 'organizations',
            headerName: 'Φορείς',
            cellRenderer: (params) => {
                const organizationPreferedLabel = [];
                params.value.forEach((data) => {
                    organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data));
                });
                return organizationPreferedLabel.join(', ');
            }
        },
        { 
            field: 'when.$date', 
            headerName: 'Ημερομηνία', 
            cellRenderer: function (params) {
                return (new Date(params.value)).toLocaleDateString();
            }, 
        },
        { field: 'toWhom', headerName: 'Υπεύθυνος'},
        { 
            field: 'status', 
            headerName: 'Κατάσταση', 
            cellRenderer: function (params) {
                return params.value ? "Απαντήθηκε" : 'Εκκρεμεί';
            },
            cellStyle: params => {
                if (params.value) {
                    return {color: 'green'};
                } else {
                    return {color: 'red'};
                }
            }
        },
    ];

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση ερωτημάτων...' };

    gridApi: GridApi<IHelpbox>;

    onGridReady(params: GridReadyEvent<IHelpbox>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.helpboxService.getAllHelpbox().subscribe((helpbox) => {
            this.helpbox = helpbox;
            this.gridApi.hideOverlay();
        });
    }

    onRowClicked(event: any): void {
        console.log(event.data);
        this.modalService.showHelpboxAnswer(event.data._id.$oid);
    }

}
