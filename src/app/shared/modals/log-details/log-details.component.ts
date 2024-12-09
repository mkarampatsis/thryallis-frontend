import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Observable } from 'rxjs';
import { ILog } from '../../interfaces/log/log.interface';
import { LogDataService } from '../../services/log-data.service';
// import { UserService } from '../../services/user.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-log-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-details.component.html',
  styleUrl: './log-details.component.css'
})
export class LogDetailsComponent {
    logDataService = inject(LogDataService)
    sanitizer = inject(DomSanitizer)

    modalRef: any;
    code: string

    results: ILog[];
    processedResults: any[] = []; // Processed data with sanitized HTML

    ngOnInit() : void {
        this.logDataService.getChanges(this.code)
        .subscribe((data)=>{
            console.log(data)
            this.results = data
            this.processedResults = this.results.map(item => ({
                ...item,
                change: {
                  ...item.change,
                  provisionText: item.change['provisionText']
                    ? this.sanitizeHtml(item.change['provisionText'])
                    : null,
                  legalProvisions: {
                    inserts: item.change['legalProvisions'].inserts.map(insert => ({
                      ...insert,
                      legalProvisionText: this.sanitizeHtml(insert.legalProvisionText)
                    }))
                  }
                }
              }));
        })
    }

    sanitizeHtml(content: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }
}
