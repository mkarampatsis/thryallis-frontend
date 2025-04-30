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
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';

@Component({
  selector: 'app-general-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgbAlertModule, AgGridAngular, GridLoadingOverlayComponent],
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
  constService = inject(ConstService);

  user = this.authService.user;
  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;

  progress = 0;
  // currentFile: File;
  // currentFiles:File;
  // fileNames: string[];
  // uploadObjectID: string | null = null;
  uploadObjectIDs: string[] = [];

  generalInfo: IGeneralInfo[];
  showGeneralInfo: IGeneralInfo[] = [];
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
    // file: new FormControl(''),
    file: new FormControl([]), // updated to array of IDs
    category: new FormControl("")
  });

  defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    floatingFilter: true,
    wrapText: true, // Wrap Text
    autoHeight: true,
    wrapHeaderText: true, // Wrap Header Text
    autoHeaderHeight: true,
  };
  
  colDefs: ColDef[] = [
    { 
      headerName: 'A/A', 
      cellRenderer : function (params) {
          return params.rowIndex +1;
      },
      flex:1 
    },
    { 
      field: 'title', 
      headerName: 'Τίτλος',
      cellRenderer: HtmlSanitizeRendererComponent,
      flex:2
    },
    { 
      field: 'text', 
      headerName: 'Κείμενο',
      cellRenderer: HtmlSanitizeRendererComponent,
      flex:2
    },
    { 
      field: 'category', 
      headerName: 'Κατηγορία',
      flex:1
    },
    { 
      field: 'when.$date', 
      headerName: 'Ημερ. ενημέρωσης', 
      cellRenderer: (params) => {
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }, 
      flex:1 
    },
    { 
      // field: 'email', 
      headerName: 'Χειριστής Helpdesk',
      valueGetter: (value) =>
        value.data.firstName + ' ' + value.data.lastName + ' (' + value.data.email.split("@")[0] + ')', 
      flex:1 
    },
    { 
      field: 'file', 
      headerName: 'Αρχείο',
      cellRenderer: function (params) {
        return params.value.length > 0 ? 'ΝΑΙ' : 'ΟΧΙ';
      },
      cellStyle: params => {
        if (params.value.length > 0) {
            return { color: 'green' };
        } else {
            return { color: 'red' };
        }
      }, 
      flex:1 
    },
  ];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση ερωτημάτων...' };

  gridApi: GridApi<IGeneralInfo>;
  
  ngOnInit() {
    // this.getAllGeneralInfo();
    this.initializeForm();
  }

  onGridReady(params: GridReadyEvent<IGeneralInfo>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.getAllGeneralInfo();
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
    this.form.controls.file.patchValue([]);
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
      // file: this.uploadObjectID,
      file: this.uploadObjectIDs,
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
        console.log(this.generalInfo);
        this.showGeneralInfo = this.generalInfo;
        this.gridApi.hideOverlay();
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

  selectFile(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected!');
      return;
    }
  
    this.progress = 0;
    const fileArray = Array.from(files);
    let completed = 0;
  
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
            this.form.controls.file.setValue( this.uploadObjectIDs);
            this.form.markAsDirty();
            console.log('All uploads complete:',  this.uploadObjectIDs);
          }
        },
      });
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

  onRowClicked(event: any): void {
    this.modalService.generalInfoModal(event.data);
  }
}

@Component({
  selector: 'app-html-sanitize-renderer',
  template: `<div [innerHTML]="sanitizedHtml"></div>`
})
export class HtmlSanitizeRendererComponent implements ICellRendererAngularComp {
  sanitizedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  agInit(params: any): void {
    this.sanitizedHtml = this.sanitizeHtml(params.value);
  }

  refresh(): boolean {
    return false;
  }

  sanitizeHtml(html: string): SafeHtml {
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : '';
  }
}