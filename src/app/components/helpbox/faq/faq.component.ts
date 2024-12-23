import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit {
    helpboxService = inject(HelpboxService)
    sanitizer = inject(DomSanitizer);

    publishedQuestions = []; 
    
    ngOnInit(): void {
        this.helpboxService.getAllPublishedHelpbox()
            .subscribe((data)=>{
                this.publishedQuestions = data['data']
            })
    }

    sanitizeHtml(html) : SafeHtml {
        if (html) {
            return this.sanitizer.bypassSecurityTrustHtml(html);
        } else {
            return ""
        }
    }
}
