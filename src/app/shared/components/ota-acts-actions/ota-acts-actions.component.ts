import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { take } from 'rxjs';
import { InstructionActService } from '../../services/instruction-act.service';
import { IInstructionAct } from '../../interfaces/instruction-act/instruction-act.interface';
import { UserService } from '../../services/user.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { OtaService } from '../../services/ota.service';


@Component({
  selector: 'app-ota-acts-actions',
  standalone: true,
  imports: [NgbTooltipModule],
  templateUrl: './ota-acts-actions.component.html',
  styleUrl: './ota-acts-actions.component.css'
})
export class OtaActsActionsComponent {
  modalService = inject(ModalService);
  uploadService = inject(FileUploadService);
  instructionActService = inject(InstructionActService);
  userService = inject(UserService);
  otaService  = inject(OtaService);

  params: ICellRendererParams;

  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    return false;
  }

  displayOta() {
    this.modalService.showOtaDetails(this.params.data);
  }

  editOta() {
    this.modalService.otaEdit(this.params.data, true)
    .pipe(take(1))
    .subscribe(result => {
      if (result) {
        // console.log('Refresh Grid Data', result);
        this.otaService.getAllOta()
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 200) {
            this.otaService.otaActsNeedUpdate.set(true);
            // this.getOta();
            // this.gridApi.setRowData(this.otaDetails);
          }
        });
      }
    });
  }

  hasOtaAdminRole() {
    return this.userService.hasOtaAdminRole()
  }

  hasOtaEditorRole() {
    return this.userService.hasOtaEditorRole()
  }
}
