import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar, toHTML  } from 'ngx-editor';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { UserService } from 'src/app/shared/services/user.service';
import { IGeneralInfo, IFile_Upload } from 'src/app/shared/interfaces/helpbox/helpbox.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
// import { set } from 'lodash-es';
import { GridApi, GridReadyEvent, ColDef, CellClickedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';

@Component({
  selector: 'app-general-info',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    NgxEditorModule, 
    NgbAlertModule, 
    NgbTooltipModule, 
    AgGridAngular
  ],
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
  checkFileStatus: boolean = true;
  generalInfoToUpdate: IGeneralInfo = {};
  uploadObjectIDs: string[] = [];

  generalInfo: IGeneralInfo[];
  showGeneralInfo: IGeneralInfo[] = [];
  text: string;

  form = new FormGroup({
    email: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    title: new FormControl('', Validators.required),
    text: new FormControl('', Validators.required),
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
    {
      field: 'actionCell',
      headerName: 'Ενέργειες',
      cellRenderer: function(params) {
        return `
          <i class="bi bi-info-circle me-2 text-primary fs-6 action-icon" data-action="info" title="Στοιχεία Πληροφορίας" role="button"></i>
          <i class="bi bi-pencil text-success fs-6 action-icon" data-action="edit" title="Επεξεργασία" role="button"></i>
          <i class="bi bi-file-x text-danger fs-6 action-icon" data-action="delete" title="Διαγραφή" role="button"></i>
        `;
      },
      filter: false,
      sortable: false,
      floatingFilter: false,
      resizable: false,
      flex: 0.5,
    },
  ];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση ερωτημάτων...' };

  gridApi: GridApi<IGeneralInfo>;
  
  ngOnInit() {
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
    this.generalInfoToUpdate = {};
  }

  onTextChange(html: object) {
    this.text = html.toString()
  }

  onSubmit() {
    console.log("generalInfoToUpdate",this.generalInfoToUpdate);
    if(Object.keys(this.generalInfoToUpdate).length === 0){
      console.log("EMPTY General Info, not update")
      const infoText = {
        email: this.form.controls.email.value,
        lastName: this.form.controls.lastName.value,
        firstName: this.form.controls.firstName.value,
        title: this.form.controls.title.value,
        text: this.text,
        file: this.uploadObjectIDs,
        category: this.form.controls.category.value        
      } as IGeneralInfo;

      this.helpboxService.newGeneralInfo(infoText)
        .subscribe(data => {
          // this.goToTab(1);
          this.initializeForm()
          this.getAllGeneralInfo();
        });
    } else {
      console.log("EMPTY General Info, update")
      console.log(
        this.form.controls.email.value,
        this.form.controls.lastName.value,
        this.form.controls.firstName.value,
        this.form.controls.title.value,
        this.text,
        this.uploadObjectIDs,
        this.form.controls.category.value,
        this.generalInfoToUpdate.file,
        this.generalInfoToUpdate["_id"]["$oid"]
      )

      const ids: string[] = this.uploadObjectIDs
      // Extract only the objects from `files` that have their $oid in `ids`
      // Step 1: Get all oids from files
      const fileOids = this.generalInfoToUpdate.file.map(f => f._id.$oid);

      // Step 2: Add ids that are NOT already in fileOids
      const additionalIds = this.uploadObjectIDs.filter(id => !fileOids.includes(id));

      // Step 3: Combine and get final list
      const finalIDs = [...fileOids, ...additionalIds];

      console.log(finalIDs);
    }
  }

  getAllGeneralInfo(){
    this.helpboxService.getGeneralInfo()
      .subscribe((data)=>{
        this.generalInfo = data;
        this.showGeneralInfo = this.generalInfo;
        this.gridApi.hideOverlay();
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
    this.checkFileStatus = true;
    this.form.controls.file.setErrors({'incorrect': false});

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
              this.form.controls.file.setValue( this.uploadObjectIDs);
              this.form.markAsDirty();
              console.log('All uploads complete:',  this.uploadObjectIDs);
            }
          },
        });
      });
    } else {
      this.form.controls.file.setErrors({'incorrect': true});
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

  onSelectionChange(event:Event){
    const selectection = event.target as HTMLInputElement;
    const value = selectection.value;
    this.showGeneralInfo = this.generalInfo;
    this.showGeneralInfo = this.generalInfo.filter((item)=>item.category.includes(value));
  }

  onCellClicked(event: CellClickedEvent): void {
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;
  
    if (action === 'info') {
      this.modalService.generalInfoModal(event.data);
    } else if (action === 'edit') {
      this.editGeneralInfo(event.data);
    } else if (action ==='delete'){
      this.deleteGeneralInfo(event.data)
    }
  }

  editGeneralInfo(data:IGeneralInfo) {
    if (this.hasHelpDeskRole()){
      this.form.controls.title.patchValue(data.title);
      this.form.controls.text.patchValue(data.text);
      // this.form.controls.file.patchValue(data.file);
      this.form.controls.category.patchValue(data.category);
      this.generalInfoToUpdate = data;
    }
  }

  deleteFile(generalInfoId:string, fileId:string){
    this.helpboxService.deleteFileFromGeneralInfo(generalInfoId, fileId)
      .subscribe(result => {
        console.log(">>",result)
        this.generalInfoToUpdate.file = result.data.file;
        this.getAllGeneralInfo();
      })
  }

  deleteGeneralInfo(data:IGeneralInfo) {
    if (this.hasHelpDeskRole()){
      this.helpboxService.deleteGeneralInfo(data["_id"]["$oid"])
        .subscribe(data=>{
          this.getAllGeneralInfo();
        })
    }
  }

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
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