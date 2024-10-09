import { Component } from '@angular/core';
import { SelectOrganizationComponent } from '../../components/select-organization/select-organization.component';

@Component({
    selector: 'app-select-organization-modal',
    standalone: true,
    imports: [SelectOrganizationComponent],
    templateUrl: './select-organization-modal.component.html',
    styleUrl: './select-organization-modal.component.css',
})
export class SelectOrganizationModalComponent {
    modalRef: any;

    onSelectedOrganization(selectedOrganization: string) {
        this.modalRef.dismiss(selectedOrganization);
    }
}
