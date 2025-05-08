import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { HelpboxService } from '../../services/helpbox.service';
import { IHelpbox, IQuestion } from '../../interfaces/helpbox/helpbox.interface';
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  helpboxService = inject(HelpboxService);
  constService = inject(ConstService);
  userService = inject(UserService);
  uploadService = inject(FileUploadService);
  modalService = inject(ModalService);
  sanitizer = inject(DomSanitizer);
  router = inject(Router);

  modalRef: any;
  helpboxId: string;

  question: IHelpbox;
  questionsNotAnswered: IQuestion[];
  organizationPreferedLabel:string[] = [];
  
  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;
  answerText: string;

  showForm = false;
  showNewQuestionButton = false;

  progress = 0;
  checkFileStatus: boolean = true;
  uploadObjectIDs: string[] = [];
  
  form = new FormGroup({
    answerText: new FormControl('', Validators.required),
    answerFile: new FormControl([]),
    finalized: new FormControl(false, Validators.required),
    questions: new FormArray([])
  });

  ngOnInit() : void {
      this.getHelpBox();
  }

  get questionsFormArray(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  isAnyCheckboxSelected(): boolean {
    return this.questionsFormArray.controls.some(control => control.value === true);
  }

  initializeForm(){
    this.form.patchValue({
      answerText: '',
      answerFile:[]
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();

    // Clear the native file input selection
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

  }

  onAnswerTextChange(html: object) {
    // this.answerText = toHTML(html);
    this.answerText = html.toString();
  }

  onSubmit() {
    const num = this.form.value.questions.length
    let loops = 1;

    for (let i = 0; i < this.form.value.questions.length; i++) { 
      const checked = this.form.value.questions[i];
      const questionsAnswered = this.question.questions.filter(q => !q.answered);
      
      if (checked) {
        const helpQuestion = {
          helpBoxId: this.helpboxId,
          questionId: questionsAnswered[i].id,
          answerText: this.answerText,
          answerFile: this.uploadObjectIDs,
          fromWhom: {
            email: this.userService.user().email,
            firstName: this.userService.user().firstName,
            lastName: this.userService.user().lastName
          },
        } as IHelpbox;
        console.log(helpQuestion);
        this.helpboxService.answerQuestion(helpQuestion)
          .subscribe(data => {
            console.log(loops, num, loops===num)
            if (loops === num) {
              console.log(data)
              this.modalRef.close()
              this.helpboxService.helpboxNeedUpdate.set(true);
            } else {
              loops++;
              console.log(loops);
            }
          });
          
      }
    }
    
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

        // Dynamically add a FormControl for each question's checkbox
        this.questionsNotAnswered = this.question.questions.filter(q => !q.answered);
        this.questionsNotAnswered.forEach((q) => {
          (this.form.get('questions') as FormArray).push(new FormControl(false));
        });
        // end
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
    const files: FileList = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected!');
      return;
    }
  
    this.progress = 0;
    const fileArray = Array.from(files);
    let completed = 0;
    this.checkFileStatus = true;
    this.form.controls.answerFile.setErrors({'incorrect': false});

    fileArray.forEach((file, index)=>{
      const permitTypes = ["pdf", "docx","xlsx", "png", "jpeg"];
      const checkFileType = permitTypes.includes(file.name.toLowerCase().split(".")[1]);
      const checkFileSize = (file.size/1024)<13000
      if (!(checkFileSize && checkFileType)) 
        this.checkFileStatus = false
    })  
  
    if (this.checkFileStatus){
      fileArray.forEach((file, index) => {
        this.uploadService.upload(file).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.progress = Math.round((100 * event.loaded) / event.total);
              console.log(`Progress for file ${index}: ${this.progress}%`);
            } else if (event instanceof HttpResponse) {
              this.uploadObjectIDs.push(event.body.id);
            }
          },
          error: (err: any) => {
            console.error(`Upload failed for file ${file.name}`, err);
          },
          complete: () => {
            completed++;
            if (completed === fileArray.length) {
                this.form.controls.answerFile.setValue(this.uploadObjectIDs);
              this.form.markAsDirty();
              console.log('All uploads complete:',  this.uploadObjectIDs);
            }
          },
        });
      });
    } else {
      this.form.controls.answerFile.setErrors({'incorrect': true});
    }
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
