import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { AgGridNoRowsOverlayComponent } from 'src/app/shared/components/ag-grid-no-rows-overlay/ag-grid-no-rows-overlay.component';

import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IFacility, ISpace } from 'src/app/shared/interfaces/facility/facility';

import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    AgGridNoRowsOverlayComponent,
    ReactiveFormsModule,
    NgbTooltipModule
  ],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.css'
})
export class FacilityComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constFacilityService = inject(ConstFacilityService);
  constService = inject(ConstService);
  userService = inject(UserService);
  modalService = inject(ModalService);
  uploadService = inject(FileUploadService);
  resourcesService = inject(ResourcesService);

  organizations: IOrganizationList[] = [];

  facilities: IFacility[] | null = [];
  spaces: ISpace[] | null = [];

  noRowsOverlayComponent: any = AgGridNoRowsOverlayComponent;

  loading = false;
  showForm = false;
  showGrid = false;
  showGridSpace = false;
  planFloorsNumField: number = 0;

  uploadObjectIDs: string[] = [];
  progress = 0;
  checkFileStatus: boolean = true;

  USE_OF_FACILITY = this.constFacilityService.USE_OF_FACILITY;
  FLOORPLANS = this.constFacilityService.FLOORPLANS;

  organization: string = '';
  organizationCode: string = '';

  defaultColDef = this.constFacilityService.defaultColDef;
  facilityColDefs: ColDef[] = this.constFacilityService.FACILTY_COL_DEFS;
  spaceColDefs: ColDef[] = this.constFacilityService.SPACE_COL_DEFS;
  autoSizeStrategy = this.constFacilityService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;
  gridApiSpace: GridApi; 

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl({ value: '', disabled: true }, Validators.required),
    kaek: new FormControl('', Validators.required),
    belongsTo: new FormControl('', Validators.required),
    distinctiveNameOfFacility: new FormControl('', Validators.required),
    useOfFacility: new FormControl('', Validators.required),
    uniqueUseOfFacility: new FormControl('true'),
    coveredPremisesArea: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    floorsOrLevels: new FormControl('', [Validators.required, Validators.pattern(/^\d+?$/)]),
    floorPlans: new FormArray([
      new FormGroup({
        level: new FormControl('', Validators.required),
        num: new FormControl('', Validators.required),
        floorArea: new FormControl('', Validators.required),
        floorPlan: new FormControl([]),
      })
    ]),
    addressOfFacility: new FormGroup({
      street: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      postcode: new FormControl('', Validators.required),
      area: new FormControl('', Validators.required),
      municipality: new FormControl('', Validators.required),
      geographicRegion: new FormControl('', Validators.required),
      country: new FormControl('ΕΛΛΑΣ', Validators.required),
    }),
    finalized: new FormControl('false'),
  });

  floorPlans = this.form.get('floorPlans') as FormArray;

  ngOnInit() {
    this.organizations= this.userService.getMyFacilites()
  }

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.getFacilitiesByOrganizationCode();
  }

  onGridReadySpace(params: GridReadyEvent<ISpace[]>): void {
    this.gridApiSpace = params.api;
    this.gridApiSpace.showLoadingOverlay();
    if (this.spaces.length > 0)
      this.gridApiSpace.hideOverlay();
  }

  onCellClicked(event: CellClickedEvent): void {
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;
        
    if (action === 'info') {
      this.showSpaces(event.data);
    } else if (action === 'edit') {
      this.editFacility(event.data);
    } else if (action === 'delete') {
      this.deleteFacility(event.data)
    } else if (action === 'add') {
      this.addSpace(event.data)
    }
  }

  onCellClickedSpace(event: CellClickedEvent): void {
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;
    
    if (action === 'editSpace') {
      console.log("EDIT SPACE", event.data)
    } else if (action === 'deleteSpace') {
      this.deleteSpace(event.data);
    } 
  }

  showSpaces(facility: IFacility){
    this.getSpacesFacilityId(facility["_id"]["$oid"])
  }

  editFacility(facility: IFacility){
    console.log("Info", facility)
  }

  deleteFacility(facility: IFacility){
    const facilityId =  facility["_id"]["$oid"];
    this.modalService.getUserConsent(
      "Πρόκειται να διαγράψετε κάποιο ακίνητο και τους χώρους του. Επιβεβαιώστε ότι θέλετε να συνεχίσετε."
    )
    .subscribe((result) => {
      if (result) {
        this.resourcesService.deleteFacilityById(facilityId)
          .subscribe(response => {
            const body = response.body;          
            const status = response.status;        
            if (status === 201) {
              this.getFacilitiesByOrganizationCode()
              this.getSpacesFacilityId(facilityId)
            }
          })
      }
    })
  }

  addSpace(facility: IFacility){
    this.modalService.addFaciltySpace(facility)
      .subscribe(result => {
        this.getSpacesFacilityId(facility["_id"]["$oid"])
      })
  }

  deleteSpace(data:ISpace){
    const spaceId = data["id"]
    const facilityId = data.facilityId["id"]
    this.modalService.getUserConsent(
      "Πρόκειται να διαγράψετε κάποιο χώρο του ακινήτου. Επιβεβαιώστε ότι θέλετε να συνεχίσετε."
    )
    .subscribe((result) => {
      if (result) {
        this.resourcesService.deleteSpaceById(spaceId)
          .subscribe(response => {
            const body = response.body;          
            const status = response.status;        
            if (status === 201) {
              this.getSpacesFacilityId(facilityId)
            }
          })
      }
    })
  }

  newFacility(data: IOrganizationList) {
    this.organization = data.preferredLabel
    this.organizationCode = data.code
    this.form.controls.organization.setValue(this.organization);
    this.form.controls.organizationCode.setValue(this.organizationCode);
    this.getFacilitiesByOrganizationCode()
    this.showForm = true;
    this.showGrid = true;
  } 

  showFacilitiesGrids(data: IOrganizationList){
    this.organizationCode = data.code
    this.showGrid = true;
  }

  showOrganizationDetails(code: string): void {
    this.modalService.showOrganizationDetails(code);
  }

  // chooseOrganizationalUnit(){
  //   this.modalService.showOrganizationUnitsByOrganizationCode(this.organizationCode)
  //     .subscribe(result => {
  //       this.organizationalUnit = result.preferredLabel;
  //       this.organizationalUnitCode = result.code;
  //       this.form.controls.organizationalUnit.setValue(this.organizationalUnit);
  //       this.form.controls.organizationalUnitCode.setValue(this.organizationalUnitCode);
  //     })
  // }

  hasFacilityAdminRole() {
    return this.userService.hasFacilityAdminRole()
  }

  hasFacilityEditorRole() {
    return this.userService.hasFacilityEditorRole()
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
    // this.form.controls.floorPlans.controls.floorPlan.setErrors({'incorrect': false});

    fileArray.forEach((file, index) => {
      const permitTypes = ["pdf", "docx", "xlsx", "png", "jpeg"];
      const checkFileType = permitTypes.includes(file.name.toLowerCase().split(".")[1]);
      const checkFileSize = (file.size / 1024) < 13000
      if (!(checkFileSize && checkFileType))
        this.checkFileStatus = false
    })

    if (this.checkFileStatus) {
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
              // this.form.controls.floorPlans.controls.questionFile.setValue( this.uploadObjectIDs);
              this.form.markAsDirty();
              console.log('All uploads complete:', this.uploadObjectIDs);
            }
          },
        });
      });
    } else {
      // this.form.controls.floorPlans.controls.questionFile.setErrors({'incorrect': true});
    }
  }

  initializeForm(): void {
    // this.form.controls.organizationalUnit.setValue('');
    // this.form.controls.organizationalUnitCode.setValue('');
    this.form.patchValue({
      organization: '',
      organizationCode: '',
      kaek: '',
      belongsTo: '',
      distinctiveNameOfFacility: '',
      useOfFacility: '',
      uniqueUseOfFacility: 'true',
      coveredPremisesArea: '',
      floorsOrLevels: '',
      floorPlans: [{
        level: '',
        num: '',
        floorArea: '',
        floorPlan: [],
      }],
      addressOfFacility: {
        street: '',
        number: '',
        postcode: '',
        area: '',
        municipality: '',
        geographicRegion: '',
        country: '',
      },
      finalized: 'false',
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();

    // Clear the native file input selection
    if (this.fileInput?.nativeElement) {
        this.fileInput.nativeElement.value = '';
    }

    this.progress = 0;
  };

  selectLevel(event: Event, i: number): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value.split(':')[1].trim();
    
    const selectedOption = this.floorPlans.at(i).get('level')?.value;
    this.floorPlans.at(i).get('num').enable();
    this.floorPlans.at(i).get('floorArea').enable();
    this.floorPlans.at(i).get('floorPlan').enable();

    if (value == 'Όροφος') {
      this.planFloorsNumField = 1;
    } else if (value == 'Ισόγειο') {
      this.floorPlans.at(i).get('num').setValue('0')
      // this.floorPlans.at(i).get('num').disable({ emitEvent: false })
      this.planFloorsNumField = 2;
    } else if (value == 'Υπόγειο') {
      this.planFloorsNumField = 3;
    } else if (value == 'Ημιυπόγειο' || value == 'Ημιόροφος' || value == 'Ταράτσα') {
      this.planFloorsNumField = 4;
      this.floorPlans.at(i).get('num').setValue('-')
      // this.floorPlans.at(i).get('num').disable({ emitEvent: false })
    } else {
      this.planFloorsNumField = 0;
    }
  }

  addFloorPlan() {
    this.floorPlans.push(
      new FormGroup({
        level: new FormControl('', Validators.required),
        num: new FormControl({value: '', disabled: true}, Validators.required),
        floorArea: new FormControl({value: '', disabled: true}, Validators.required),
        floorPlan: new FormControl({value: [], disabled: true}),
      }),
    );
  }

  removeFloorPlan(index: number) {
    this.floorPlans.removeAt(index);
  }

  resetForm(){
    this.initializeForm(); 
  }

  submitForm(){
    const data = this.form.value as IFacility;
    data["organization"] = this.organization;
    data["organizationCode"] = this.organizationCode;

    this.resourcesService.newFacility(data)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 201) {
          this.getFacilitiesByOrganizationCode();
          this.initializeForm();
        }
      })
  }

  getFacilitiesByOrganizationCode(){
    this.resourcesService.getFacilitiesByOrganizationCode(this.organizationCode)
    .subscribe(result => {
      const body = result.body;          
      const status = result.status;  
      if (status===200) {
        this.facilities = body
      }
    })
  }

  getSpacesFacilityId(id:string) {
    this.resourcesService.getSpacesByFacilityId(id)
      .subscribe(result => {
        const body = result.body;          
        const status = result.status;  
        if (status===200) {
          this.spaces = body
          if ( this.spaces.length > 0 ) {
            this.showGridSpace = true;
          }
          else {
            this.showGridSpace = false;
          }
        }
      })
  }
}