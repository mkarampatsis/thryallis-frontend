import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { take } from 'rxjs';
import { LegalActService } from '../../services/legal-act.service';
import { ILegalAct } from '../../interfaces/legal-act/legal-act.interface';

@Component({
    selector: 'app-legal-acts-actions',
    standalone: true,
    imports: [],
    templateUrl: './legal-acts-actions.component.html',
    styleUrl: './legal-acts-actions.component.css',
})
export class LegalActsActionsComponent implements ICellRendererAngularComp {
    modalService = inject(ModalService);
    uploadService = inject(FileUploadService);
    legalActService = inject(LegalActService);

    params: ICellRendererParams;

    agInit(params: ICellRendererParams<any, any, any>): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams<any, any, any>): boolean {
        return false;
    }

    displayFEK() {
        this.uploadService
            .getUploadByID(this.params.data.legalActFile.$oid)
            .pipe(take(1))
            .subscribe((data) => {
                const url = window.URL.createObjectURL(data);
                const link = document.createElement('a');
                link.href = url;
                link.download = this.params.data.legalActKey + '.pdf';
                this.modalService.showPdfViewer(link);
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);
            });
    }

    editLegalAct() {
        this.legalActService
            .getLegalActById(this.params.data._id.$oid)
            .pipe(take(1))
            .subscribe((legalAct: ILegalAct) => {
                this.modalService
                    .editLegalAct(legalAct)
                    .pipe(take(1))
                    .subscribe({
                        next: (data) => {
                            console.log('LEGAL ACT EDITED', data);
                            this.legalActService.legalActsNeedUpdate.set(true);
                        },
                        error: (error) => {
                            console.error(error);
                        },
                    });
            });
    }
}
