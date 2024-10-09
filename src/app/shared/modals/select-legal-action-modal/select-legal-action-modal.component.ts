import { Component } from '@angular/core';
import { SelectLegalActionComponent } from 'src/app/shared/components/select-legal-action/select-legal-action.component';

@Component({
    selector: 'app-select-legal-action-modal',
    standalone: true,
    imports: [SelectLegalActionComponent],
    templateUrl: './select-legal-action-modal.component.html',
    styleUrl: './select-legal-action-modal.component.css',
})
export class SelectLegalActionModalComponent {
    modalRef: any;

    onSelectedLegalAct(selectedLegalAct: string) {
        this.modalRef.dismiss(selectedLegalAct);
    }
}
