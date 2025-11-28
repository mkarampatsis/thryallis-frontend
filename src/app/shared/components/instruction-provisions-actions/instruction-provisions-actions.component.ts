import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-instruction-provisions-actions',
  standalone: true,
  imports: [MatIconModule, NgbTooltipModule],
  templateUrl: './instruction-provisions-actions.component.html',
  styleUrl: './instruction-provisions-actions.component.css'
})
export class InstructionProvisionsActionsComponent {
  modalService = inject(ModalService);
  params: ICellRendererParams;

  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    return false;
  }

  displayInstructionProvision() {
    this.modalService.showInstructionProvision(this.params.data);
  }
}
