import { Component, inject, OnDestroy, OnInit, EventEmitter, Output, effect } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { IHelpbox } from 'src/app/shared/interfaces/helpbox/helpbox.interface';

@Component({
  selector: 'app-editors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
  templateUrl: './editors.component.html',
  styleUrl: './editors.component.css'
})
export class EditorsComponent implements OnInit, OnDestroy {
    @Output() changeTab = new EventEmitter<number>();
    authService = inject(AuthService);
    constService = inject(ConstService);
    uploadService = inject(FileUploadService);
    helpboxService = inject(HelpboxService);

    user = this.authService.user;
    organizationPreferedLabel:string[] = [];

    newQuestion = this.helpboxService.helpboxNewQuestion;
    const 

    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;
    questionText: string;
    notFinalized: IHelpbox[] = [];
    showInputField = false;

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    form = new FormGroup({
        email: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        organizations : new FormControl([]),
        questionTitle: new FormControl('', Validators.required),
        questionCategory: new FormControl('', Validators.required),
        question: new FormGroup({
            questionText: new FormControl('', Validators.required),
            questionFile: new FormControl(''),
        }),
        // questionSelect: new FormControl('')
    });

    constructor(){
      effect(
        () => {
            if (this.newQuestion()) {
                console.log("xxxx", this.newQuestion())
                this.newQuestion.set(null);
            }
        },
        { allowSignalWrites: true },
    );
    }

    ngOnInit() {
        this.helpboxService.getAllHelpbox().subscribe((data) => {
            this.notFinalized = data.filter(item => item.finalized===false && item.email===this.user().email);
        })
        this.initializeForm();
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    initializeForm(){
        this.form.controls.email.patchValue(this.user().email);
        this.form.controls.firstName.patchValue(this.user().firstName);
        this.form.controls.lastName.patchValue(this.user().lastName);
        this.form.controls.questionTitle.patchValue("")
        this.form.controls.questionCategory.patchValue("")
        this.form.controls.question.patchValue({
            questionText: this.questionText,
            questionFile : ""
        });
        
        const foreas = this.user().roles.filter(data => data.role==="EDITOR")[0].foreas
        this.form.controls.organizations.patchValue(foreas);
            
        foreas.every(data=> {
            this.organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data))
        });
    }

    onQuestionTextChange(html: object) {
        this.questionText = toHTML(html);
    }


    onSubmit() {
        
        const helpQuestion = {
            email: this.form.controls.email.value,
            lastName: this.form.controls.lastName.value,
            firstName: this.form.controls.firstName.value,
            organizations: this.form.controls.organizations.value,
            questionTitle: this.form.controls.questionTitle.value,
            questionCategory: this.form.controls.questionCategory.value,
            question: {
                questionText: this.questionText,
                questionFile: this.uploadObjectID
            },
        } as unknown as IHelpbox;

        // const value = this.form.controls.questionSelect.value.split('_');

        // if (value[0]==="new"){ 
            this.helpboxService.newQuestion(helpQuestion)
                .subscribe(data => {
                    this.goToTab(1);
                });
        // } else {
        //     const id = value[1];
        //     this.helpboxService.updateQuestion(helpQuestion, id)
        //     .subscribe(data => {
        //         this.goToTab(1);
        //     });
        // }
    }

    resetForm(){
        this.organizationPreferedLabel = [];
        this.questionText = '';
        this.initializeForm(); 
    }

    goToTab(tabIndex: number): void {
        this.changeTab.emit(tabIndex); // Emit the tab index to parent
    }

    // showSelectValue() {
    //     const value = this.form.controls.questionSelect.value.split('_');

    //     if (value[0] === "new") {
    //         this.showInputField = true
    //         this.form.controls.questionTitle.patchValue('')
    //     }
    //     else {
    //         this.showInputField = false
    //         this.form.controls.questionTitle.patchValue(value[0])
    //     }
    // }

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
                    this.form.controls.question.controls.questionFile.setValue(this.uploadObjectID);
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

    hasUploadedFile(): boolean {
        return this.form.controls.question.controls.questionFile.value !== null;
    }
}
