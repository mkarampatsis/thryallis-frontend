import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from 'src/app/shared/services/modal.service';
import { take } from 'rxjs';
import { IGeneralInfo } from 'src/app/shared/interfaces/helpbox/helpbox.interface';

@Component({
  selector: 'app-general-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './general-info-modal.component.html',
  styleUrl: './general-info-modal.component.css'
})
export class GeneralInfoModalComponent {
  sanitizer = inject(DomSanitizer);
  helpboxService = inject(HelpboxService);
  uploadService = inject(FileUploadService);
  modalService = inject(ModalService);

  modalRef: any;
  data: IGeneralInfo;
  
  displayFile(fileId:string) {
    this.uploadService
      .getUploadByID(fileId)
      .pipe(take(1))
      .subscribe((data) => {
        if (data.type==="application/pdf") {
          const url = window.URL.createObjectURL(data);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'document.pdf';
          this.modalService.showPdfViewer(link);
        } else {
          // const type = data.type.split('/')[1];
          if (data.type==='image/png'){
            this.helpboxService.downloadFile(data, 'image.png', 'image/png');
          }
          if (data.type=='image/jpeg'){
            this.helpboxService.downloadFile(data, 'photo.jpg', 'image/png');
          }
          if (data.type=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
            this.helpboxService.downloadFile(data, 'sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          }
          if (data.type=='application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            this.helpboxService.downloadFile(data, 'document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
          }
        }
    });
  }

  sanitizeHtml(html) : SafeHtml {
    if (html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
        return ""
    }
  }

}
