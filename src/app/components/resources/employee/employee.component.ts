import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';

import { ColDef, GridApi, GridReadyEvent, CellClickedEvent, RowClickedEvent, FirstDataRenderedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { AgGridNoRowsOverlayComponent } from 'src/app/shared/components/ag-grid-no-rows-overlay/ag-grid-no-rows-overlay.component';

import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';

import { IEmployee } from 'src/app/shared/interfaces/employee/employee';;

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    AgGridAngular,
    AgGridNoRowsOverlayComponent,
  ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  @ViewChild('firstnameField') firstnameField!: ElementRef<HTMLInputElement>;

  userService = inject(UserService);
  modalService = inject(ModalService);
  resourceService = inject(ResourcesService);
  constFacilityService = inject(ConstFacilityService);

  organizations: IOrganizationList[] = [];
  employees: IEmployee[] = [];

  organization: string = '';
  organizationCode: string = '';

  showForm: boolean = false;
  showGrid: boolean = false;
  readOnlyMode: boolean = false;
  updateMode: boolean = false;

  autoSizeStrategy = this.constFacilityService.autoSizeStrategy;
  defaultColDef = this.constFacilityService.defaultColDef;
  employeeColDefs: ColDef[] = this.constFacilityService.EMPLOYEE_COL_DEFS;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }),
    organizationCode: new FormControl(''),
    code: new FormControl({ value: '', disabled: true }),
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    fathername: new FormControl('', Validators.required),
    mothername: new FormControl('', Validators.required),
    identity: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    sex: new FormControl('', Validators.required),
    dateAppointment: new FormControl('', Validators.required),
    workStatus: new FormControl(''),
    workCategory: new FormControl(''),
    workSector: new FormControl(''),
    organizationalUnit: new FormControl('', Validators.required),
    organizationalUnitCode: new FormControl(''),
    building: new FormControl(''),
    office: new FormControl(''),
    phoneWork: new FormControl(''),
    emailWork: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]),
    finalized: new FormControl(false),
    qualifications: new FormArray([this.createQualification()]),
  });

  createQualification(): FormGroup {
    return new FormGroup({
      qualification: new FormControl(''),
      qualificationTitle: new FormControl(''),
      qualificationOrganization: new FormControl(''),
      date: new FormControl(''),
      file: new FormControl(null)
    });
  }

  ngOnInit() {
    this.organizations = this.userService.getMyUserResources()
  }

  showOrganizationDetails(code: string): void {
    this.modalService.showOrganizationDetails(code);
  }

  newEmployee(data: IOrganizationList) {
    // Reset the form first
    this.form.reset();
    this.organization = data.preferredLabel
    this.organizationCode = data.code
    this.form.controls.organization.setValue(this.organization);
    this.form.controls.organizationCode.setValue(this.organizationCode);
    this.showForm = true;
    setTimeout(() => {
      this.firstnameField?.nativeElement.focus();
    })
  }

  showEmployeesGrid(data: IOrganizationList) {
    this.resourceService.getEmployessByOrganizationCode(data.code)
    .subscribe(response => {
      const body = response.body;          
      const status = response.status;        
      if (status === 200) {
        this.employees = body;
        if (this.employees.length > 0) {
          this.showGrid = true;
        }
      }
    })
  }

  onCellClicked(event: CellClickedEvent): void {
    this.showForm = false;
    this.updateMode = false;
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;
        
    if (action === 'showEmployee') {
      this.showEmployee(event.data);
    } else if (action === 'editEmployee'){
      this.editEmployee(event.data);
    } else if (action === 'deleteEmployee') {
      this.deleteEmployee(event.data)
    } 
  }

  showEmployee(data: IEmployee){
    // reuse your editFacility logic to populate the form
    this.editEmployee(data);

    // disable the entire form after patching
    setTimeout(() => {
      this.form.disable();
    });
    
    this.readOnlyMode = true; // activate readonly mode
  }

  editEmployee(employee: IEmployee){
    this.readOnlyMode = false; // editing mode
    this.updateMode = true;
    this.showForm = true;
    // Reset the form first
    this.form.reset();
   
    const toDateString = (dateObj: any) => {
      if (!dateObj) return '';
      if (typeof dateObj === 'string') return dateObj; // already in ISO form
      if (dateObj.$date) return new Date(dateObj.$date).toISOString().substring(0, 10);
      return '';
    };

    // Patch simple (non-array) values
    this.form.patchValue({
      organization: employee.organization,
      organizationCode: employee.organizationCode,
      code: employee.code,
      firstname: employee.firstname,
      lastname: employee.lastname,
      fathername: employee.fathername,
      mothername: employee.mothername,
      identity: employee.identity,
      birthday: toDateString(employee.birthday),
      sex: employee.sex,
      dateAppointment: toDateString(employee.dateAppointment),
      workStatus: employee.workStatus,
      workCategory: employee.workCategory,
      workSector: employee.workSector,
      organizationalUnit: employee.organizationalUnit,
      organizationalUnitCode: employee.organizationalUnitCode,
      building: employee.building,
      office: employee.office,
      phoneWork: employee.phoneWork,
      emailWork: employee.emailWork,
      finalized: employee.finalized || false,
    });

    // Handle qualifications array
    const qualificationsFormArray = this.form.get('qualifications') as FormArray;
    qualificationsFormArray.clear();

    if (employee.qualifications && employee.qualifications.length > 0) {
      employee.qualifications.forEach((q: any) => {
        qualificationsFormArray.push(new FormGroup({
          qualification: new FormControl(q.qualification),
          qualificationTitle: new FormControl(q.qualificationTitle),
          qualificationOrganization: new FormControl(q.qualificationOrganization),
          date: new FormControl(toDateString(q.date)),
          file: new FormControl(q.file || null)
        }));
      });
    } else {
      // If none exist, ensure at least one blank group remains
      qualificationsFormArray.push(this.createQualification());
    }

    // Optionally re-enable disabled controls for editing
    this.form.enable();
    
    setTimeout(() => {
      this.firstnameField?.nativeElement.focus();
    })
  }

  deleteEmployee(data: IEmployee){
    const email = data.emailWork
    this.resourceService.deleteEmployee(email)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 201) {
          this.getEmployees(data.organizationCode);
          this.resetForm();
        }
      })
  }

  get qualifications(): FormArray {
    return this.form.get('qualifications') as FormArray;
  }

  addQualification(): void {
    this.qualifications.push(this.createQualification());
  }

  removeQualification(index: number): void {
    if (this.qualifications.length > 1) {
      this.qualifications.removeAt(index);
    }
  }

  onSubmit(): void {

    // const invalid = [];
    // const controls = this.form.controls;
    // for (const name in controls) {
    //   if (controls[name].invalid) {
    //     invalid.push(name);
    //   }
    // }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employeeData = this.form.getRawValue() as unknown as IEmployee;
    if (this.form.valid) {

      if (!this.updateMode){
        this.resourceService.newEmployee(employeeData)
          .subscribe(response => {
            const body = response.body;          
            const status = response.status;        
            if (status === 201) {
              this.getEmployees(this.organizationCode)
              this.resetForm();
            }
          })
      } else {
        this.resourceService.updateEmployee(employeeData)
          .subscribe(response => {
            const body = response.body;          
            const status = response.status;        
            if (status === 201) {
              this.getEmployees(employeeData.organizationCode)
              this.resetForm();
            }
          })
      }
    }
  }

  resetForm(): void {
    // Clear FormArray first
    this.qualifications.clear();

    // Add one empty qualification
    this.qualifications.push(this.createQualification());

    // Reset form values, keeping disabled controls
    this.form.reset({
      organization: '',
      organizationCode: '',
      code: '',
      firstname: '',
      lastname: '',
      fathername: '',
      mothername: '',
      identity: '',
      birthday: '',
      sex: '',
      dateAppointment: '',
      workStatus: '',
      workCategory: '',
      workSector: '',
      organizationalUnit: '',
      organizationalUnitCode: '',
      building: '',
      office: '',
      phoneWork: '',
      emailWork: '',
      finalized: false
    });
    this.showForm = false;
  }

  getEmployees(code: string){
    this.resourceService.getEmployessByOrganizationCode(code)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 200) {
          this.employees = body;
          if (this.employees.length > 0) {
            this.showGrid = true;
          }
        }
      })
  }

  hasUserResourcesAdminRole() {
    return this.userService.hasUserResourcesAdminRole()
  }

  hasUserResourcesEditorRole() {
    return this.userService.hasUserResourcesEditorRole()
  }

  onGridReady(params: GridReadyEvent<IEmployee>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    if (this.employees.length > 0)
      this.gridApi.hideOverlay();
  }
}
