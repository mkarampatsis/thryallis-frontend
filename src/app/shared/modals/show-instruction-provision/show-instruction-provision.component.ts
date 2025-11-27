import { Component } from '@angular/core';
import { IInstructionProvision } from 'src/app/shared/interfaces/instruction-provision/instruction-provision.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-instruction-provision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-instruction-provision.component.html',
  styleUrl: './show-instruction-provision.component.css'
})
export class ShowInstructionProvisionComponent {
    instructionProvision: IInstructionProvision;
    modalRef: any;
}
