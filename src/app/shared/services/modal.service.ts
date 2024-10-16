import { Injectable, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ILegalAct } from '../interfaces/legal-act/legal-act.interface';
import { ILegalProvision } from '../interfaces/legal-provision/legal-provision.interface';

import { Observable, take } from 'rxjs';

import { SelectLegalActionModalComponent } from 'src/app/shared/modals/select-legal-action-modal/select-legal-action-modal.component';
import { SelectLegalProvisionModalComponent } from 'src/app/shared/modals/select-legal-provision-modal/select-legal-provision-modal.component';
import { ShowLegalProvisionComponent } from 'src/app/shared/modals/show-legal-provision/show-legal-provision.component';
import { PdfViewerComponent } from 'src/app/shared/modals/pdf-viewer/pdf-viewer.component';
import { SelectOrganizationModalComponent } from 'src/app/shared/modals/select-organization-modal/select-organization-modal.component';
import { YesNoComponent } from 'src/app/shared/modals/yes-no/yes-no.component';
import { OrganizationDetailsComponent } from 'src/app/shared/modals/organization-details/organization-details.component';
import { OrganizationUnitDetailsComponent } from 'src/app/shared/modals/organization-unit-details/organization-unit-details.component';
import { OrganizationTreeModalComponent } from 'src/app/shared/modals/organization-tree-modal/organization-tree-modal.component';
import { FileUploadComponent } from 'src/app/shared/modals/file-upload/file-upload.component';
import { ForeasEditComponent } from 'src/app/shared/modals/foreas-edit/foreas-edit.component';
import { BackendErrorComponent } from 'src/app/shared/modals/backend-error/backend-error.component';
import { RemitModalComponent } from 'src/app/shared/modals/remit-modal/remit-modal.component';
import { LegalProvisionModalComponent } from 'src/app/shared/modals/legal-provision-modal/legal-provision-modal.component';
import { LegalActModalComponent } from 'src/app/shared/modals/legal-act-modal/legal-act-modal.component';
import { IRemit } from '../interfaces/remit/remit.interface';
import { MonadaEditComponent } from '../modals/monada-edit/monada-edit.component';
import { UserAccessesComponent } from '../modals/user-accesses/user-accesses.component';
import { IUser } from '../interfaces/auth';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    modalService = inject(NgbModal);

    showOrganizationDetails(organizationCode: string) {
        const modalRef = this.modalService.open(OrganizationDetailsComponent, {
            fullscreen: 'lg',
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.organizationCode = organizationCode;
        modalRef.componentInstance.modalRef = modalRef;
    }

    showOrganizationUnitDetails(organizationUnitCode: string) {
        const modalRef = this.modalService.open(OrganizationUnitDetailsComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.organizationalUnitCode = organizationUnitCode;
        modalRef.componentInstance.modalRef = modalRef;
    }

    showOrganizationTree(organizationCode: string) {
        const modalRef = this.modalService.open(OrganizationTreeModalComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.organizationCode = organizationCode;
        modalRef.componentInstance.modalRef = modalRef;
    }

    uploadFile() {
        const modalRef = this.modalService.open(FileUploadComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.modalRef = modalRef;
    }

    foreasEdit(foreas_id: string) {
        const modalRef = this.modalService.open(ForeasEditComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.foreas_id = foreas_id;
        modalRef.componentInstance.modalRef = modalRef;
    }

    monadaEdit(monada_id: string) {
        const modalRef = this.modalService.open(MonadaEditComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.monada_id = monada_id;
        modalRef.componentInstance.modalRef = modalRef;
    }

    showBackendError(message: string) {
        const modalRef = this.modalService.open(BackendErrorComponent, {
            size: 'md',
            centered: true,
        });
        modalRef.componentInstance.message = message;
        modalRef.componentInstance.modalRef = modalRef;
    }

    showLegalProvision(legalProvision: ILegalProvision) {
        const modalRef = this.modalService.open(ShowLegalProvisionComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.legalProvision = legalProvision;
        modalRef.componentInstance.modalRef = modalRef;
    }

    newRemit(organizationalUnit: { preferredLabel: string; code: string }) {
        const modalRef = this.modalService.open(RemitModalComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;
        modalRef.componentInstance.organizationalUnit = organizationalUnit;
    }

    editRemit(organizationalUnit: { preferredLabel: string; code: string }, remit: IRemit) {
        const modalRef = this.modalService.open(RemitModalComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;
        modalRef.componentInstance.organizationalUnit = organizationalUnit;
        modalRef.componentInstance.remit = remit;
    }

    newLegalProvision() {
        const modalRef = this.modalService.open(LegalProvisionModalComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;

        return modalRef.dismissed.pipe(take(1)) as Observable<{
            legalProvision: ILegalProvision;
        }>;
    }

    editLegalProvision(legalProvision: ILegalProvision) {
        const modalRef = this.modalService.open(LegalProvisionModalComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;
        modalRef.componentInstance.legalProvision = legalProvision;

        return modalRef.dismissed.pipe(take(1)) as Observable<{
            legalProvision: ILegalProvision;
        }>;
    }

    newLegalAct() {
        const modalRef = this.modalService.open(LegalActModalComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;
        return modalRef.dismissed.pipe(take(1)) as Observable<boolean>;
    }

    editLegalAct(legalAct: ILegalAct) {
        const modalRef = this.modalService.open(LegalActModalComponent, {
            size: 'xl',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;
        modalRef.componentInstance.legalAct = legalAct;
        return modalRef.dismissed.pipe(take(1)) as Observable<boolean>;
    }

    selectOrganization() {
        const modalRef = this.modalService.open(SelectOrganizationModalComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.modalRef = modalRef;
        return modalRef.dismissed.pipe(take(1)) as Observable<string>;
    }

    selectLegalAct() {
        const modalRef = this.modalService.open(SelectLegalActionModalComponent, {
            fullscreen: 'lg',
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.modalRef = modalRef;
        return modalRef.dismissed.pipe(take(1)) as Observable<string>;
    }

    selectLegalProvision() {
        const modalRef = this.modalService.open(SelectLegalProvisionModalComponent, {
            fullscreen: 'lg',
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.modalRef = modalRef;
        return modalRef.dismissed.pipe(take(1)) as Observable<ILegalProvision[]>;
    }

    showPdfViewer(pdfURL: HTMLAnchorElement) {
        const modalRef = this.modalService.open(PdfViewerComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.pdfURL = pdfURL;
        modalRef.componentInstance.modalRef = modalRef;
    }

    userAccesses(user: IUser) {
        const modalRef = this.modalService.open(UserAccessesComponent, {
            size: 'xl',
            centered: true,
        });
        modalRef.componentInstance.user = user;
        modalRef.componentInstance.modalRef = modalRef;
    }

    getUserConsent(prompt: string) {
        const modalRef = this.modalService.open(YesNoComponent, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
        });
        modalRef.componentInstance.modalRef = modalRef;
        modalRef.componentInstance.prompt = prompt;
        return modalRef.dismissed.pipe(take(1)) as Observable<boolean>;
    }
}
