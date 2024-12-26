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
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { take } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';

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
    uploadService = inject(FileUploadService);
    modalService = inject(ModalService);
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

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    form = new FormGroup({
        answerText: new FormControl('', Validators.required),
        answerFile: new FormControl(''),
        finalized: new FormControl(false, Validators.required)
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
        const helpQuestion = {
            helpBoxId: this.helpboxId,
            questionId: this.questionId,
            answerText: this.answerText,
            answerFile: this.uploadObjectID,
            fromWhom: this.userService.user().email,
        } as IHelpbox;

        this.helpboxService.answerQuestion(helpQuestion)
            .subscribe(data => {
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

    getHelpBox(){
        this.helpboxService.getHelpboxById(this.helpboxId)
            .subscribe((data)=>{
                this.question = data[0];
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

    displayPDF(fileId:string) {
        this.uploadService
            .getUploadByID(fileId)
            .pipe(take(1))
            .subscribe((data) => {
                const url = window.URL.createObjectURL(data);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'document.pdf';
                this.modalService.showPdfViewer(link);
            });
    }

    hasHelpDeskRole() {
        return this.userService.hasHelpDeskRole();
    }

    hasEditorRole() {
        return this.userService.hasEditorRole();
    }
}
