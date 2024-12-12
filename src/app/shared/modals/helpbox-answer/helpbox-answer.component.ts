import { Component, inject } from '@angular/core';
import { HelpboxService } from '../../services/helpbox.service';
import { IHelpbox } from '../../interfaces/helpbox/helpbox.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { UserService } from 'src/app/shared/services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-helpbox-answer',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
  templateUrl: './helpbox-answer.component.html',
  styleUrl: './helpbox-answer.component.css'
})
export class HelpboxAnswerComponent {
  helpboxService = inject(HelpboxService);
  constService = inject(ConstService);
  userService = inject(UserService);

  modalRef: any;
  id: string

  question: IHelpbox;
  organizationPreferedLabel:string[] = [];
  
  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;
  answerText: string;

  form = new FormGroup({
    answerText: new FormControl('', Validators.required),
  });
  
  ngOnInit() : void {
      this.helpboxService.getHelpboxById(this.id)
        .subscribe((data)=>{
          this.question = data[0];
          this.question.organizations.every(data=> {
            this.organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data))
          });  
          if (this.question.answerText) {
            this.answerText=this.question.answerText;
            this.initializeForm();
          }
        })
  }

  initializeForm(){
    this.form.controls.answerText.patchValue(this.answerText);
  }

  onAnswerTextChange(html: object) {
    this.answerText = html.toString();
  }


  onSubmit() {
    const helpQuestion = {
        id: this.id,
        answerText: this.answerText,
    } as IHelpbox;


    this.helpboxService.answerQuestion(helpQuestion)
        .subscribe(data => {
          console.log(data)
          this.helpboxService.helpboxNeedUpdate.set(true);
        });
  }

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  hasEditorRole() {
    return this.userService.hasEditorRole();
  }
}
