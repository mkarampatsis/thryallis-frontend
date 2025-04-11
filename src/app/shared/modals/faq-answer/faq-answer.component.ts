import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faq-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-answer.component.html',
  styleUrl: './faq-answer.component.css'
})
export class FaqAnswerComponent {
  sanitizer = inject(DomSanitizer);
  
  modalRef: any;
  data: any;

  sanitizeHtml(html) : SafeHtml {
    if (html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
        return ""
    }
}
}
