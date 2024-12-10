import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
// import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';

@Component({
  selector: 'app-editors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
  templateUrl: './editors.component.html',
  styleUrl: './editors.component.css'
})
export class EditorsComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  constService = inject(ConstService);
  uploadService = inject(FileUploadService);
  helpboxService = inject(HelpboxService);

  user = this.authService.user;
  organizationPreferedLabel:string[] = [];

  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;
  questionText: string;

  progress = 0;
  currentFile: File;
  uploadObjectID: string | null = null;

  form = new FormGroup({
    email: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    organizations : new FormControl([]),
    questionText: new FormControl('', Validators.required),
    // questionFile: new FormControl(null, Validators.required),
  });


  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  initializeForm(){
    this.form.controls.email.patchValue(this.user().email);
    this.form.controls.firstName.patchValue(this.user().firstName);
    this.form.controls.lastName.patchValue(this.user().lastName);
    this.form.controls.questionText.patchValue(this.questionText);

    const foreas = this.user().roles.filter(data => data.role==="EDITOR")[0].foreas
    this.form.controls.organizations.patchValue(foreas);
        
    foreas.every(data=> {
      this.organizationPreferedLabel.push(this.constService.getOrganizationPrefferedLabelByCode(data))
    });    
  }

  onQuestionTextChange(html: object) {
    this.questionText = html.toString();
  }


  onSubmit() {
    console.log(this.form.value);
    this.helpboxService.newQuestion(this.form.value);
  }

  resetForm(){
    this.organizationPreferedLabel = [];
    this.questionText = '';
    this.initializeForm(); 
  }

  // selectFile(event: any): void {
  //   if (event.target.files.length === 0) {
  //       console.log('No file selected!');
  //       return;
  //   }
  //   this.currentFile = event.target.files[0];
  //   this.uploadService.upload(this.currentFile).subscribe({
  //       next: (event: any) => {
  //           if (event.type === HttpEventType.UploadProgress) {
  //               this.progress = Math.round((100 * event.loaded) / event.total);
  //           } else if (event instanceof HttpResponse) {
  //               this.uploadObjectID = event.body.id;
  //               this.form.controls.questionFile.setValue(this.uploadObjectID);
  //               this.form.markAsDirty();
  //           }
  //       },
  //       error: (err: any) => {
  //           console.log(err);
  //       },
  //       complete: () => {
  //           console.log('Upload complete');
  //       },
  //   });
  // }

  // hasUploadedFile(): boolean {
  //   return this.form.get('questionFile').value !== null;
  // }
}
