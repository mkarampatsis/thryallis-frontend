import { Component } from '@angular/core';
import { SelectInstructionProvisionComponent } from '../../components/select-instruction-provision/select-instruction-provision.component';
import { IInstructionProvision } from '../../interfaces/instruction-provision/instruction-provision.interface';

@Component({
  selector: 'app-select-instruction-provision-modal',
  standalone: true,
  imports: [SelectInstructionProvisionComponent],
  templateUrl: './select-instruction-provision-modal.component.html',
  styleUrl: './select-instruction-provision-modal.component.css'
})
export class SelectInstructionProvisionModalComponent {
  modalRef: any;
  
  onSelectedInstructionProvision(selectedInstructionProvision: IInstructionProvision[]) {
    this.modalRef.dismiss(selectedInstructionProvision);
  }
}
