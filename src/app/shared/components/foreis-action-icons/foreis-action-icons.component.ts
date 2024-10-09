import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-foreis-action-icons',
    standalone: true,
    imports: [MatIconModule, NgbTooltipModule],
    templateUrl: './foreis-action-icons.component.html',
    styleUrl: './foreis-action-icons.component.css',
    host: { class: 'd-block z-3' },
})
export class ForeisActionIconsComponent implements ICellRendererAngularComp {
    authService = inject(AuthService);
    modalService = inject(ModalService);
    params: ICellRendererParams;

    agInit(params: ICellRendererParams<any, any, any>): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams<any, any, any>): boolean {
        return false;
    }

    showOrganizationDetails(): void {
        this.modalService.showOrganizationDetails(this.params.data.code);
    }

    showOrganizationTree(): void {
        this.modalService.showOrganizationTree(this.params.data.code);
    }

    showUpload(): void {
        this.modalService.uploadFile();
    }

    editForeas(): void {
        this.modalService.foreasEdit(this.params.data.code);
    }

    canEdit(code: string): boolean {
        return this.authService.canEdit(code);
    }
}
