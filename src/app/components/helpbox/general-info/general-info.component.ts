import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
// import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { IGeneralInfo } from 'src/app/shared/interfaces/helpbox/helpbox.interface';

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
        this.text = toHTML(html);
    }

    onSubmit() {
            
        const helpQuestion = {
            email: this.form.controls.email.value,
            lastName: this.form.controls.lastName.value,
            firstName: this.form.controls.firstName.value,
            title: this.form.controls.title.value,
            text: this.text,
           
        } as IGeneralInfo;

        // this.helpboxService.newQuestion(helpQuestion)
        //         .subscribe(data => {
        //             this.goToTab(1);
        //         });
    }
}
