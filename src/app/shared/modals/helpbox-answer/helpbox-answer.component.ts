import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { HelpboxService } from '../../services/helpbox.service';
import { IHelpbox } from '../../interfaces/helpbox/helpbox.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { UserService } from 'src/app/shared/services/user.service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { take } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-helpbox-answer',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        NgxEditorModule, 
        NgbAlertModule,
        NgbTooltipModule,
        NgIf
    ],
    templateUrl: './helpbox-answer.component.html',
    styleUrl: './helpbox-answer.component.css'
})
export class HelpboxAnswerComponent {
    helpboxService = inject(HelpboxService);
    constService = inject(ConstService);
    userService = inject(UserService);
    uploadService = inject(FileUploadService);
    modalService = inject(ModalService);
    sanitizer = inject(DomSanitizer);
    router = inject(Router);

    modalRef: any;
    helpboxId: string;
    questionId: string;

    question: IHelpbox;
    organizationPreferedLabel:string[] = [];
    
    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;
    answerText: string;

    showForm = false;
    showNewQuestionButton = false;

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    form = new FormGroup({
      answerText: new FormControl('', Validators.required),
      answerFile: new FormControl(''),
      finalized: new FormControl(false, Validators.required),
      questions: new FormGroup({
        questionId: new FormControl()
      })
    });
  
    ngOnInit() : void {
        this.getHelpBox();
    }

    initializeForm(){
        this.form.controls.answerText.patchValue(this.answerText);
        this.form.controls.answerFile.patchValue('');
    }

    onAnswerTextChange(html: object) {
        this.answerText = toHTML(html);
    }

    onSubmit() {
      console.log(this.form.value)
      // const helpQuestion = {
      //   helpBoxId: this.helpboxId,
      //   questionId: this.questionId,
      //   answerText: this.answerText,
      //   answerFile: this.uploadObjectID,
      //   fromWhom: {
      //     email: this.userService.user().email,
      //     firstName: this.userService.user().firstName,
      //     lastName: this.userService.user().lastName
      //   },
      // } as IHelpbox;

      // this.helpboxService.answerQuestion(helpQuestion)
      //   .subscribe(data => {
      //     this.modalRef.close()
      //     this.helpboxService.helpboxNeedUpdate.set(true);
      //   });
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

    publishQuestion(questionId:string, published:boolean) {
      this.helpboxService.publishHelpBoxById({helpBoxId: this.helpboxId, questionId: questionId['$oid'], published:!published})
        .subscribe((data) => {
          this.helpboxService.helpboxNeedUpdate.set(true);
          this.modalRef.close()
        });    
    }

    finalizeConversation(){
        const finalized = !this.question.finalized
        this.helpboxService.finalizeHelpBoxById({id: this.helpboxId, finalized: finalized})
            .subscribe((data) => {
                this.helpboxService.helpboxNeedUpdate.set(true);
                this.modalRef.close()
            });    
    }

    newQuestion(){
      this.helpboxService.helpboxNewQuestion.set(this.question);
      this.router.navigate([], {
        queryParams: { tab: null },
        queryParamsHandling: "merge",
        skipLocationChange: true,
      }).then(() => {
        this.router.navigate(['helpbox'], {
          queryParams: { tab: 2 },
          queryParamsHandling: "merge",
          replaceUrl: true,
        });
      });
      this.modalRef.close()
    }

    getHelpBox(){
        this.helpboxService.getHelpboxById(this.helpboxId)
            .subscribe((data)=>{
                this.question = data;
                this.showNewQuestionButton = this.question.finalized ? false : true;
                this.question.organizations.every(data=> {
                    this.organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data))
            });  
            if (this.hasHelpDeskRole()) {
                // this.answerText=this.question.answerText;
                this.initializeForm();
            }
        })
    }

    selectFile(event: any): void {
    
        if (event.target.files.length === 0) {
            console.log('No file selected!');
            return;
        }
        this.currentFile = event.target.files[0];

        this.uploadService.upload(this.currentFile).subscribe({
            next: (event: any) => {
                if (event.type === HttpEventType.UploadProgress) {
                    this.progress = Math.round((100 * event.loaded) / event.total);
                } else if (event instanceof HttpResponse) {
                    this.uploadObjectID = event.body.id;
                    this.form.controls.answerFile.setValue(this.uploadObjectID);
                    this.form.markAsDirty();
                }
            },
            error: (err: any) => {
                console.log(err);
            },
            complete: () => {
                console.log('Upload complete');
            },
        });
    }

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

    hasHelpDeskRole() {
        return this.userService.hasHelpDeskRole();
    }

    hasEditorRole() {
        return this.userService.hasEditorRole();
    }
}
