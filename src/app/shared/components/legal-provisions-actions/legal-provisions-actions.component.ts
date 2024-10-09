import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
    standalone: true,
    imports: [MatIconModule, NgbTooltipModule],
    templateUrl: './legal-provisions-actions.component.html',
    styleUrl: './legal-provisions-actions.component.css',
})
export class LegalProvisionsActionsComponent implements ICellRendererAngularComp {
    modalService = inject(ModalService);
    params: ICellRendererParams;

    agInit(params: ICellRendererParams<any, any, any>): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams<any, any, any>): boolean {
        return false;
    }

    displayLegalProvision() {
        this.modalService.showLegalProvision(this.params.data);
    }
}
