import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { UserService } from 'src/app/shared/services/user.service';
import { IGeneralInfo } from 'src/app/shared/interfaces/helpbox/helpbox.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { set } from 'lodash-es';

@Component({
  selector: 'app-general-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
  templateUrl: './general-info.component.html',
  styleUrl: './general-info.component.css'
})
export class GeneralInfoComponent {
    authService = inject(AuthService);
    uploadService = inject(FileUploadService);
    helpboxService = inject(HelpboxService);
    userService = inject(UserService);
    modalService = inject(ModalService);
    sanitizer = inject(DomSanitizer);

    user = this.authService.user;
    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    generalInfo: IGeneralInfo[];
    showGeneralInfo: IGeneralInfo[];
    text: string;
    // tags: string[] | null = [];
    // selectedValues: string[] = [];
    // showSelectedValues: string[] = [];

    form = new FormGroup({
        email: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        title: new FormControl('', Validators.required),
        text: new FormControl('', Validators.required),
        file: new FormControl(''),
        category: new FormControl("")
    });

    ngOnInit() {
        this.getAllGeneralInfo();
        this.initializeForm();
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    initializeForm(){
        this.form.controls.email.patchValue(this.user().email);
        this.form.controls.firstName.patchValue(this.user().firstName);
        this.form.controls.lastName.patchValue(this.user().lastName);
        this.form.controls.title.patchValue("");
        this.form.controls.text.patchValue("");
        this.form.controls.file.patchValue("");
        this.form.controls.category.patchValue("");
    }

    onTextChange(html: object) {
        this.text = html.toString()
    }

    onSubmit() {

        // const inputValues = this.form.controls.tags.value.split(",").map(item => item.trim())
        // this.selectedValues = this.selectedValues.concat(inputValues);
           
        const infoText = {
            email: this.form.controls.email.value,
            lastName: this.form.controls.lastName.value,
            firstName: this.form.controls.firstName.value,
            title: this.form.controls.title.value,
            text: this.text,
            file: this.uploadObjectID,
            // tags: this.selectedValues
            category: this.form.controls.category.value
           
        } as IGeneralInfo;

        this.helpboxService.newGeneralInfo(infoText)
                .subscribe(data => {
                    // this.goToTab(1);
                    this.initializeForm()
                    this.getAllGeneralInfo();
                });
    }

    getAllGeneralInfo(){
        this.helpboxService.getGeneralInfo()
            .subscribe((data)=>{
                this.generalInfo = data;
                this.showGeneralInfo = this.generalInfo;
                // data.forEach(data => {
                //     this.tags = this.tags.concat(data.tags);
                // })
                // this.tags = [...new Set(this.tags)];
            })
    }

    resetForm(){
        this.text = '';
        this.initializeForm(); 
    }

    sanitizeHtml(html) : SafeHtml {
        if (html) {
            return this.sanitizer.bypassSecurityTrustHtml(html);
        } else {
            return ""
        }
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
                    this.form.controls.file.setValue(this.uploadObjectID);
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
                  console.log(data.type);
                  if (data.type=='image/png')
                    this.helpboxService.downloadFile("imageBinaryData", 'image.png', 'image/png');
                  if (data.type=='image/jpeg')
                    this.helpboxService.downloadFile("imageBinaryData", 'photo.jpg', 'image/png');
                  if (data.type=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    this.helpboxService.downloadFile("xlsxBinaryData", 'sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                  if (data.type=='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                    this.helpboxService.downloadFile("xlsxBinaryData", 'sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                  this.helpboxService.downloadFile("docxBinaryData", 'document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                  // const url = window.URL.createObjectURL(data);
                  // const link = document.createElement('a');
                  // link.href = url;
                  // link.download = 'document.'+type;
                  // console.log(link.download);
                }
            });
    }

    // onCheckboxChange(event:Event){
    //     const checkbox = event.target as HTMLInputElement;
    //     const value = checkbox.value;

    //     if (checkbox.checked) {
    //         // Add value to selectedValues if checked
    //         this.selectedValues.push(value);
    //     } else {
    //         // Remove value from selectedValues if unchecked
    //         this.selectedValues = this.selectedValues.filter((item) => item !== value);
    //     }
    // }

    onSelectionChange(event:Event){
      const selectection = event.target as HTMLInputElement;
      const value = selectection.value;
      this.showGeneralInfo = this.generalInfo;
      this.showGeneralInfo = this.generalInfo.filter((item)=>item.category.includes(value));
    }

    hasHelpDeskRole() {
        return this.userService.hasHelpDeskRole();
    }
    
    hasEditorRole() {
        return this.userService.hasEditorRole();
    }
}
