import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpboxService } from '../../services/helpbox.service';
import { IHelpbox } from '../../interfaces/helpbox/helpbox.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { UserService } from 'src/app/shared/services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-helpbox-answer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
  templateUrl: './helpbox-answer.component.html',
  styleUrl: './helpbox-answer.component.css'
})
export class HelpboxAnswerComponent {
  helpboxService = inject(HelpboxService);
  constService = inject(ConstService);
  userService = inject(UserService);
  sanitizer = inject(DomSanitizer);

  modalRef: any;
  helpboxId: string;
  questionId: string;

  question: IHelpbox;
  organizationPreferedLabel:string[] = [];
  
  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;
  answerText: string;

  showForm = false;

  form = new FormGroup({
    answerText: new FormControl('', Validators.required),
    finalized: new FormControl(false, Validators.required)
  });
  
  ngOnInit() : void {
      this.helpboxService.getHelpboxById(this.helpboxId)
        .subscribe((data)=>{
            console.log(data)
            this.question = data[0];
            this.question.organizations.every(data=> {
            this.organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data))
          });  
          // if (this.question.answerText) {
            // this.answerText=this.question.answerText;
            // this.initializeForm();
          // }
          if (this.hasHelpDeskRole()) {
            // this.answerText=this.question.answerText;
            this.initializeForm();
          }
        })
  }

  initializeForm(){
    this.form.controls.answerText.patchValue(this.answerText);
  }

  onAnswerTextChange(html: object) {
    this.answerText = toHTML(html);
  }


  onSubmit() {
    const helpQuestion = {
        helpBoxId: this.helpboxId,
        questionId: this.questionId,
        answerText: this.answerText,
        fromWhom: this.userService.user().email,
    } as IHelpbox;

    console.log(helpQuestion)

    this.helpboxService.answerQuestion(helpQuestion)
        .subscribe(data => {
          console.log(data)
          this.modalRef.close()
          this.helpboxService.helpboxNeedUpdate.set(true);
        });
  }

  sanitizeHtml(html) : SafeHtml {
    if (html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
        return ""
    }
  }

  answerQuestion(id:string){
    if (this.hasHelpDeskRole()){
        this.showForm = true;
        this.questionId = id['$oid']
    }
  }

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  hasEditorRole() {
    return this.userService.hasEditorRole();
  }
}
