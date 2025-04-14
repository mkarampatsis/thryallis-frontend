import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { ILegalProvision } from '../../interfaces/legal-provision/legal-provision.interface';
import { ModalService } from '../../services/modal.service';
import { LegalProvisionService } from '../../services/legal-provision.service';
import { indexOf } from 'lodash-es';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LegalActService } from '../../services/legal-act.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-list-legal-provisions',
    standalone: true,
    imports: [CommonModule, ClipboardModule, NgbTooltipModule],
    templateUrl: './list-legal-provisions.component.html',
    styleUrl: './list-legal-provisions.component.css',
})
export class ListLegalProvisionsComponent implements OnChanges {
    @Input() legalProvisions: ILegalProvision[] = [];
    @Output() legalProvisionsChange = new EventEmitter<ILegalProvision[]>();
    @Input() code: string = null;
    @Input() remitID: string = null;
    @Input() provisionType: 'organization' | 'organizationalUnit' | 'remit' = null;
    @Input() actionColumnVisible = false;
    modalService = inject(ModalService);
    legalProvisionService = inject(LegalProvisionService);
    legalActService = inject(LegalActService);
    uploadService = inject(FileUploadService);


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.legalProvisions) {
            this.legalProvisions = changes.legalProvisions.currentValue;
            this.sortLegalProvisions();
        }
    }

    sortLegalProvisions() {
        const legalProvisions = this.legalProvisions;

        const sortedData = legalProvisions.map((obj) => {
            const dateStr = obj.legalActKey.match(/\d{2}-\d{2}-\d{4}$/)?.[0]; // Extract date in format DD-MM-YYYY
            if (dateStr) {
                const [day, month, year] = dateStr.split('-');
                const isoDateStr = `${year}-${month}-${day}`;
                const date = new Date(isoDateStr);
                return { ...obj, date };
            } else {
                return { ...obj, date: null };
            }
        });

        // Sort the array by date in descending order
        sortedData.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
        this.legalProvisions = sortedData;
    }

    displayLegalProvision(provision: ILegalProvision) {
        this.modalService.showLegalProvision(provision);
    }

    removeLegalProvision(i: number) {
        // console.log(this.legalProvisions);
        this.modalService
            .getUserConsent(
                `Πρόκειται να διαγράψετε τη διάταξη που βασίζεται στο <strong>${this.legalProvisions[i].legalActKey}</strong>. Παρακαλούμε επιβεβαιώστε ότι επιθυμείτε να συνεχίσετε.`,
            )
            .subscribe((result) => {
                if (result) {
                    this.legalProvisionService
                        .deleteLegalProvision(this.legalProvisions[i]._id)
                        .subscribe((response) => {
                            this.legalProvisions.splice(i, 1);
                            this.legalProvisionService.legalProvisionsNeedUpdate.set(true);
                        });
                }
            });
    }

    removeNewLegalProvision(i: number) {
        this.legalProvisions.splice(i, 1);
    }

    editLegalProvision(currentProvision: ILegalProvision): void {
        // console.log('CURRENT PROVISION >>>>>>>>>>>>>>>>', currentProvision);
        this.modalService.editLegalProvision(currentProvision).subscribe((data) => {
            if (data) {
                const updatedProvision = data.legalProvision;
                this.modalService
                    .getUserConsent(
                        'Πρόκειται να ενημερώσετε μια υπάρχουσα διάταξη. Επιβεβαιώστε ότι θέλετε να συνεχίσετε.',
                    )
                    .subscribe((result) => {
                        if (result) {
                            this.legalProvisionService
                                .updateLegalProvision(
                                    this.provisionType,
                                    this.code,
                                    currentProvision,
                                    updatedProvision,
                                    this.remitID,
                                )
                                .subscribe((response) => {
                                    console.log("EDIT>>", response.updatedLegalProvision);
                                    const currentProvisionIndex = indexOf(this.legalProvisions, currentProvision);
                                    this.legalProvisions.splice(currentProvisionIndex, 1);
                                    this.legalProvisions.push(response.updatedLegalProvision);
                                    this.sortLegalProvisions();
                                    this.legalProvisionService.legalProvisionsNeedUpdate.set(true);
                                    this.legalProvisionService.legalProvisionObjectUpdate.set(response.updatedLegalProvision)
                                });
                        }
                    });
                // const tempLegalProvision = [data.legalProvision, ...this.legalProvisions];
                // this.legalProvisions = uniqWith(tempLegalProvision, (a, b) => {
                //     return a.legalActKey === b.legalActKey && isEqual(a.legalProvisionSpecs, b.legalProvisionSpecs);
                // });
                // this.sortLegalProvisions();
            }
        });
    }

    get countAllLegalProvisionsExceptNew() {
        return this.legalProvisions.filter((provision) => !provision.isNew).length;
    }

    displayPDF(legalActKey:string){
        this.legalActService
            .getLegalActByActKey(legalActKey)
            .pipe(take(1))
            .subscribe((data) => {
                this.uploadService
                    .getUploadByID(data.legalActFile.$oid)
                    .pipe(take(1))
                    .subscribe((data) => {
                        const url = window.URL.createObjectURL(data);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'document.pdf';
                        this.modalService.showPdfViewer(link);
                    });
            });
    }
}
