import { Component } from '@angular/core';
import { SelectLegalProvisionComponent } from 'src/app/shared/components/select-legal-provision/select-legal-provision.component';
import { ILegalProvision } from '../../interfaces/legal-provision/legal-provision.interface';

@Component({
    selector: 'app-select-legal-provision-modal',
    standalone: true,
    imports: [SelectLegalProvisionComponent],
    templateUrl: './select-legal-provision-modal.component.html',
    styleUrl: './select-legal-provision-modal.component.css',
})
export class SelectLegalProvisionModalComponent {
    modalRef: any;

    onSelectedLegalProvision(selectedLegalProvision: ILegalProvision[]) {
        this.modalRef.dismiss(selectedLegalProvision);
    }
}
