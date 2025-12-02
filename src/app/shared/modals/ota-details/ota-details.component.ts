import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOta } from '../../interfaces/ota/ota.interface';
import { ListLegalProvisionsComponent } from 'src/app/shared/components/list-legal-provisions/list-legal-provisions.component';
import { ListInstructionProvisionsComponent } from '../../components/list-instruction-provisions/list-instruction-provisions.component';

@Component({
  selector: 'app-ota-details',
  standalone: true,
  imports: [CommonModule, ListLegalProvisionsComponent, ListInstructionProvisionsComponent],
  templateUrl: './ota-details.component.html',
  styleUrl: './ota-details.component.css'
})
export class OtaDetailsComponent {

  data: IOta;
  modalRef: any;
}
