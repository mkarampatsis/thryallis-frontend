import { Component, inject, effect } from '@angular/core';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
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

    helpbox: IHelpbox[] = [];

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = [
      { field: 'key', headerName: 'Κωδικός Ερώτησης', flex:1 },
      { field: 'questionTitle', headerName: 'Τίτλος Συνομιλίας', flex:1 },
      { field: 'questionCategory', headerName: 'Κατηγορία', flex:1 },
      { 
        headerName: 'Χρήστης',
        valueGetter: (value) =>
          value.data.firstName + ' ' + value.data.lastName + ' (' + value.data.email.split("@")[0] + ')', 
        flex:1 
      },
      // { field: 'firstName', headerName: 'Χρήστης', flex:1 },
      // { field: 'lastName', headerName: 'Επίθετο', flex:1 },
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
        unSortIcon: true,
        filter: false,
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
      { 
        field: 'toWhom', 
        headerName: 'Χειριστής Helpdesk',
        cellRenderer: function (params) {
          let user = params.value.firstName + ' ' + params.value.lastName + ' (' + params.value.email.split("@")[0] +')';
          return user;
        }, 
        flex:1
      },
      { 
        field: 'questions', 
        headerName: 'Ερωτήσεις/Απαντήσεις', 
        cellRenderer: function (params) {
            let answered = params.value.filter(value => value.answered === true);
            // let checker = params.value.every(value => value.answered === true);
            // console.log(checker);
            // return params.value ? "Απαντήθηκε" : 'Εκκρεμεί';
            return params.value.length + "/" + answered.length;
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
        headerName: 'Κατάσταση συνομιλίας', 
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
        unSortIcon: true,
        filter: false,
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
      this.helpboxService.getAllHelpbox()
      .subscribe((helpbox) => {
        if (this.userService.hasEditorRole()) {
          this.helpbox = helpbox.filter(item => item.email===this.userService.user().email);
        } else {
          this.helpbox = helpbox;
        }
        // console.log(">>>",this.helpbox)
        this.gridApi.hideOverlay();
      });
    }

    onRowClicked(event: any): void {
      this.modalService.showHelpboxAnswer(event.data._id.$oid);
    }

}
