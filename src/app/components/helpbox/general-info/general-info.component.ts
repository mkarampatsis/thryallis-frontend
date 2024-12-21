import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
// import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { UserService } from 'src/app/shared/services/user.service';
import { IGeneralInfo } from 'src/app/shared/interfaces/helpbox/helpbox.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    sanitizer = inject(DomSanitizer);

    user = this.authService.user;
    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;

    progress = 0;
    currentFile: File;
    uploadObjectID: string | null = null;

    generalInfo: IGeneralInfo[];
    text: string;

    form = new FormGroup({
        email: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        title: new FormControl('', Validators.required),
        text: new FormControl('', Validators.required),
        // file?: string | null;
    });

    ngOnInit() {
        // this.helpboxService.getAllGeneralInfo().subscribe((data) => {
        //     this.generalInfo = data
        // })
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
        this.form.controls.title.patchValue("")
        this.form.controls.text.patchValue("");
    }

    onTextChange(html: object) {
        // console.log(html);
        // this.text = toHTML(html);
        this.text = html.toString()
    }

    onSubmit() {
            
        const infoText = {
            email: this.form.controls.email.value,
            lastName: this.form.controls.lastName.value,
            firstName: this.form.controls.firstName.value,
            title: this.form.controls.title.value,
            text: this.text,
           
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

    hasHelpDeskRole() {
        return this.userService.hasHelpDeskRole();
    }
    
    hasEditorRole() {
        return this.userService.hasEditorRole();
    }
}
