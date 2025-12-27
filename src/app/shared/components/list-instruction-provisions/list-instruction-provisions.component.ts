import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { IInstructionProvision } from '../../interfaces/instruction-provision/instruction-provision.interface';
import { InstructionActService } from '../../services/instruction-act.service';
import { InstructionProvisionService } from '../../services/instruction-provision.service';

import { ModalService } from '../../services/modal.service';
import { indexOf } from 'lodash-es';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { take } from 'rxjs';


interface InstructionProvisionVM extends IInstructionProvision {
  rowspan?: number;
  showInstructionActKey?: boolean;
}

@Component({
  selector: 'app-list-instruction-provisions',
  standalone: true,
  imports: [CommonModule, ClipboardModule, NgbTooltipModule],
  templateUrl: './list-instruction-provisions.component.html',
  styleUrl: './list-instruction-provisions.component.css'
})
export class ListInstructionProvisionsComponent {

  @Input() instructionProvisions: IInstructionProvision[] = [];
  @Output() instructionProvisionsChange = new EventEmitter<IInstructionProvision[]>();
  @Input() code: string = null;
  @Input() remitID: string = null;
  @Input() provisionType: 'organization' | 'organizationalUnit' | 'remit' | 'ota' | 'ota_instructions' = null;
  @Input() actionColumnVisible = false;
  modalService = inject(ModalService);
  instructionProvisionService = inject(InstructionProvisionService);
  instructionActService = inject(InstructionActService);
  uploadService = inject(FileUploadService);

  instructionProvisionsVM: InstructionProvisionVM[] = []

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.instructionProvisions) {
      // this.instructionProvisions = changes.instructionProvisions.currentValue;
      this.instructionProvisionsVM = this.prepareInstructionProvisions(changes.instructionProvisions.currentValue);
      this.sortInstructionProvisions();
    }

  }

  sortInstructionProvisions() {
    // const instructionProvisions = this.instructionProvisions;
    const instructionProvisions = this.instructionProvisionsVM;

    const sortedData = instructionProvisions.map((obj) => {
      const dateStr = obj.instructionActKey.match(/\d{2}-\d{2}-\d{4}$/)?.[0]; // Extract date in format DD-MM-YYYY
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
    // this.instructionProvisions = sortedData;
    this.instructionProvisionsVM = sortedData;
  }

  displayInstructionProvision(provision: IInstructionProvision) {
    this.modalService.showInstructionProvision(provision);
  }

  removeInstructionProvision(i: number) {
    // console.log(this.instructionProvisions);
    this.modalService
      .getUserConsent(
        `Πρόκειται να διαγράψετε τη διάταξη που βασίζεται στο <strong>${this.instructionProvisions[i].instructionActKey}</strong>. Παρακαλούμε επιβεβαιώστε ότι επιθυμείτε να συνεχίσετε.`,
      )
      .subscribe((result) => {
        if (result) {
          this.instructionProvisionService
            .deleteInstructionProvision(this.instructionProvisions[i]._id)
            .subscribe((response) => {
              this.instructionProvisions.splice(i, 1);
              this.instructionProvisionService.instructionProvisionsNeedUpdate.set(true);
            });
        }
      });
  }

  removeNewInstructionProvision(i: number) {
    this.instructionProvisions.splice(i, 1);
  }

  editInstructionProvision(currentProvision: IInstructionProvision): void {
    // console.log('CURRENT PROVISION >>>>>>>>>>>>>>>>', currentProvision);
    this.modalService.editInstructionProvision(currentProvision).subscribe((data) => {
      // console.log('DATA >>>>>>>>>>>>>>>>', data);
      if (data) {
        const updatedProvision = data.instructionProvision;
        this.modalService
          .getUserConsent(
            'Πρόκειται να ενημερώσετε μια υπάρχουσα επιμέρους ενότητα εγκυγκλίου. Επιβεβαιώστε ότι θέλετε να συνεχίσετε.',
          )
          .subscribe((result) => {
            if (result) {
              this.instructionProvisionService
                .updateInstructionProvision(
                  this.provisionType,
                  this.code,
                  currentProvision,
                  updatedProvision,
                  this.remitID,
                )
                .subscribe((response) => {
                  // console.log('RESPONSE>>>', response);
                  // console.log("EDIT>>", response.updatedInstructionProvision);
                  const currentProvisionIndex = indexOf(this.instructionProvisions, currentProvision);
                  this.instructionProvisions.splice(currentProvisionIndex, 1);
                  this.instructionProvisions.push(response.updatedInstructionProvision);
                  this.sortInstructionProvisions();
                  this.instructionProvisionService.instructionProvisionsNeedUpdate.set(true);
                  this.instructionProvisionService.instructionProvisionObjectUpdate.set(response.updatedInstructionProvision)
                });
            }
          });
      }
    });
  }

  get countAllInstructionProvisionsExceptNew() {
    return this.instructionProvisions.filter((provision) => !provision.isNew).length;
  }

  displayPDF(instructionActKey: string) {
    this.instructionActService
      .getInstructionsActByActKey(instructionActKey)
      .pipe(take(1))
      .subscribe((data) => {
        this.uploadService
          .getUploadByID(data.instructionActFile.$oid)
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

  prepareInstructionProvisions(data: any[]): InstructionProvisionVM[] {
    const result: InstructionProvisionVM[] = [];

    let i = 0;
    while (i < data.length) {
      const currentKey = data[i].instructionActKey;

      // Count how many consecutive rows share the same key
      let count = 1;
      while (
        i + count < data.length &&
        data[i + count].instructionActKey === currentKey
      ) {
        count++;
      }

      // First row → show cell with rowspan
      result.push({
        ...data[i],
        rowspan: count,
        showInstructionActKey: true,
      });

      // Remaining rows → hide the merged cell
      for (let j = 1; j < count; j++) {
        result.push({
          ...data[i + j],
          rowspan: 0,
          showInstructionActKey: false,
        });
      }

      i += count;
    }

    return result;
  }
}
