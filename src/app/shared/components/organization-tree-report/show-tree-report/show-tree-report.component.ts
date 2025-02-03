import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-show-tree-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-tree-report.component.html',
  styleUrl: './show-tree-report.component.css'
})
export class ShowTreeReportComponent {
  @Input() node: any;
  @Input() prefix: string = '';
  @Input() code: string | null = null;

  sanitizer = inject(DomSanitizer);

  sanitizeHtml(html) : SafeHtml {
    if (html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
        return ""
    }
}
}
