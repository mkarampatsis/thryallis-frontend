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
    text: string;
    tags: string[];

    form = new FormGroup({
        email: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        title: new FormControl('', Validators.required),
        text: new FormControl('', Validators.required),
        file: new FormControl(''),
        tags: new FormControl("")
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
        this.form.controls.tags.patchValue("");
    }

    onTextChange(html: object) {
        this.text = html.toString()
    }

    onSubmit() {
            
        const infoText = {
            email: this.form.controls.email.value,
            lastName: this.form.controls.lastName.value,
            firstName: this.form.controls.firstName.value,
            title: this.form.controls.title.value,
            text: this.text,
            file: this.uploadObjectID,
            // tags: this.form.controls.tags.value
           
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
                this.generalInfo = data
                // this.tags = data.map((data) => {
                //     return data.tags
                // })
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
