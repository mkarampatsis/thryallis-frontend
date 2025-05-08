import { Component, inject, OnDestroy, OnInit, EventEmitter, Output, effect, ViewChild, ElementRef } from '@angular/core';
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
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    
    authService = inject(AuthService);
    constService = inject(ConstService);
    uploadService = inject(FileUploadService);
    helpboxService = inject(HelpboxService);

    user = this.authService.user;
    organizationPreferedLabel:string[] = [];

    addNewQuestion = this.helpboxService.helpboxNewQuestion;
    newQuestionId: string = '';
    newQuestion: boolean = false;
    
    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;
    questionText: string;
    notFinalized: IHelpbox[] = [];
    showInputField = false;

    progress = 0;
    checkFileStatus: boolean = true;
    helpboxToUpdate: IHelpbox = {};
    uploadObjectIDs: string[] = [];
    // currentFile: File;
    // uploadObjectID: string | null = null;

    form = new FormGroup({
        email: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        organizations : new FormControl([]),
        questionTitle: new FormControl('', Validators.required),
        questionCategory: new FormControl('', Validators.required),
        question: new FormGroup({
            questionText: new FormControl('', Validators.required),
            questionFile: new FormControl([]),
        }),
        // questionSelect: new FormControl('')
    });

    constructor(){
      effect(
        () => {
          if (this.addNewQuestion()) {
            this.newQuestionId = this.addNewQuestion()["id"];
            this.form.controls.email.patchValue(this.user().email);
            this.form.controls.firstName.patchValue(this.user().firstName);
            this.form.controls.lastName.patchValue(this.user().lastName);
            this.form.controls.questionTitle.patchValue(this.addNewQuestion().questionTitle)
            this.form.controls.questionTitle.disable()
            this.form.controls.questionCategory.patchValue(this.addNewQuestion().questionCategory)
            this.form.controls.questionCategory.disable()
            this.newQuestion = true;
            this.addNewQuestion.set(null);
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
      this.form.patchValue({
        email: this.user().email,
        firstName: this.user().firstName,
        lastName: this.user().lastName,
        organizations : [],
        questionTitle: '',
        questionCategory: '',
        question: {
            questionText: '',
            questionFile:[]
        }
      });

      const foreas = this.user().roles.filter(data => data.role==="EDITOR")[0].foreas
      this.form.controls.organizations.patchValue(foreas);
          
      foreas.every(data=> {
        this.organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data))
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();

      // Clear the native file input selection
      if (this.fileInput?.nativeElement) {
          this.fileInput.nativeElement.value = '';
      }
  
      this.progress = 0;
      this.helpboxToUpdate = {};
    }

    onTextChange(html: object) {
      // this.questionText = toHTML(html);
      this.questionText = html.toString()
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
            // questionFile: this.uploadObjectID
            questionFile: this.uploadObjectIDs
        },
      } as unknown as IHelpbox;

      // const value = this.form.controls.questionSelect.value.split('_');

      // if (value[0]==="new"){ 
      if (! this.newQuestion) {
        this.helpboxService.newQuestion(helpQuestion)
          .subscribe(data => {
              this.goToTab(1);
          });
      } else {
        // const id = value[1];
        // this.helpboxService.updateQuestion(helpQuestion, id)
        this.helpboxService.updateQuestion(helpQuestion,this.newQuestionId)
        .subscribe(data => {
            this.goToTab(1);
        });
      }
    }

    resetForm(){
        this.organizationPreferedLabel = [];
        this.questionText = '';
        this.initializeForm(); 
    }

    goToTab(tabIndex: number): void {
        this.changeTab.emit(tabIndex); // Emit the tab index to parent
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
      this.form.controls.question.controls.questionFile.setErrors({'incorrect': false});
  
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
                  this.form.controls.question.controls.questionFile.setValue( this.uploadObjectIDs);
                this.form.markAsDirty();
                console.log('All uploads complete:',  this.uploadObjectIDs);
              }
            },
          });
        });
      } else {
          this.form.controls.question.controls.questionFile.setErrors({'incorrect': true});
      }
    }

    deleteFile(helpBoxId:string, fileId:string){
      this.helpboxService.deleteFileFromHelpBox(helpBoxId, fileId)
        .subscribe(result => {
          this.helpboxToUpdate.questions["questionFile"] = result.data.questions["questionFile"];
        //   this.getAllGeneralInfo();
        })
    }

    hasUploadedFile(): boolean {
        // return this.form.controls.question.controls.questionFile.value !== null;
        return this.form.controls.question.controls.questionFile.value !== null;
    }
}
