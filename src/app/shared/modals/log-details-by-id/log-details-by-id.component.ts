import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILog } from '../../interfaces/log/log.interface';
import { LogDataService } from '../../services/log-data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ListLegalProvisionsComponent } from '../../components/list-legal-provisions/list-legal-provisions.component';


@Component({
  selector: 'app-log-details-by-id',
  standalone: true,
  imports: [CommonModule, ListLegalProvisionsComponent],
  templateUrl: './log-details-by-id.component.html',
  styleUrl: './log-details-by-id.component.css',
})
export class LogDetailsByIdComponent {
  logDataService = inject(LogDataService);
  sanitizer = inject(DomSanitizer);

  modalRef: any;
  id!: string;

  result!: ILog;
  // processedResults: any[] = []; // Processed data with sanitized HTML

  ngOnInit(): void {
    this.logDataService.getChangeById(this.id)
    .subscribe(data => {
      console.log(data)
      this.result = data;
      // this.processedResults = this.results.map(item => ({
      //     ...item,
      //     change: {
      //       ...item.change,
      //       provisionText: item.change['provisionText']
      //         ? this.sanitizeHtml(item.change['provisionText'])
      //         : null,
      //       legalProvisions: {
      //         inserts: item.change['legalProvisions'].inserts.map(insert => ({
      //           ...insert,
      //           legalProvisionText: this.sanitizeHtml(insert.legalProvisionText)
      //         }))
      //       }
      //     }
      //   }));
    });
  }

  sanitizeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
