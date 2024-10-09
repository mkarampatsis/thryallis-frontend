import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-monades-action-icons',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './monades-action-icons.component.html',
    styleUrl: './monades-action-icons.component.css',
})
export class MonadesActionIconsComponent implements ICellRendererAngularComp {
    modalService = inject(ModalService);
    authService = inject(AuthService);

    params: ICellRendererParams;

    agInit(params: ICellRendererParams<any, any, any>): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams<any, any, any>): boolean {
        return false;
    }

    showOrganizationUnitDetails(): void {
        this.modalService.showOrganizationUnitDetails(this.params.data.code);
    }

    canEdit(code: string): boolean {
        return this.authService.canEdit(code);
    }

    newRemit(organizationUnit: any) {
        // This is a whole organization unit object that is passed to the modal
        // The new remit input interface is respected
        // TODO: Come back later to this
        this.modalService.newRemit(organizationUnit);
    }
}
