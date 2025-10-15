import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-faq-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-answer.component.html',
  styleUrl: './faq-answer.component.css'
})
export class FaqAnswerComponent {
  sanitizer = inject(DomSanitizer);
  userService = inject(UserService);
  modalService = inject(ModalService);
  
  modalRef: any;
  data: any;

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  modify(){
    this.modalRef.close();
    this.modalService.showHelpboxAnswer(this.data._id.$oid);
  }

  sanitizeHtml(html): SafeHtml {
    if (html) {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
      return ""
    }
  }
}
