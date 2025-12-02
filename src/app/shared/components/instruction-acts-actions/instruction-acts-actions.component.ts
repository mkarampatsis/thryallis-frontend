import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { take } from 'rxjs';
import { InstructionActService } from '../../services/instruction-act.service';
import { IInstructionAct } from '../../interfaces/instruction-act/instruction-act.interface';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-instruction-acts-actions',
  standalone: true,
  imports: [],
  templateUrl: './instruction-acts-actions.component.html',
  styleUrl: './instruction-acts-actions.component.css'
})
export class InstructionActsActionsComponent {
  modalService = inject(ModalService);
  uploadService = inject(FileUploadService);
  instructionActService = inject(InstructionActService);
  authService = inject(AuthService)

  user = this.authService.user;

  params: ICellRendererParams;

  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    return false;
  }

  displayFile() {
    this.uploadService
      .getUploadByID(this.params.data.instructionActFile.$oid)
      .pipe(take(1))
      .subscribe((data) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.params.data.instructionActKey + '.pdf';
        this.modalService.showPdfViewer(link);
      });
  }

  editInstructionAct() {
    this.instructionActService
      .getInstructionActById(this.params.data._id.$oid)
      .pipe(take(1))
      .subscribe((instructionAct: IInstructionAct) => {
        this.modalService
          .editInstructionAct(instructionAct)
          .pipe(take(1))
          .subscribe({
            next: (data) => {
              console.log('INSTRUCTION ACT EDITED', data);
              this.instructionActService.instructionActsNeedUpdate.set(true);
            },
            error: (error) => {
              console.error(error);
            },
          });
      });
  }
}
