import { Component } from '@angular/core';
import { SelectInstructionActionComponent } from 'src/app/shared/components/select-instruction-action/select-instruction-action.component';

@Component({
  selector: 'app-select-instruction-action-modal',
  standalone: true,
  imports: [SelectInstructionActionComponent],
  templateUrl: './select-instruction-action-modal.component.html',
  styleUrl: './select-instruction-action-modal.component.css'
})
export class SelectInstructionActionModalComponent {
  modalRef: any;

  onSelectedInstructionAct(selectedInstructionAct: string) {
    this.modalRef.dismiss(selectedInstructionAct);
  }
}
