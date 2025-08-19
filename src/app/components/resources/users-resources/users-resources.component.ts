import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';

import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { IEmployee } from 'src/app/shared/interfaces/employee/employee';

@Component({
  selector: 'app-users-resources',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTooltipModule
  ],
  templateUrl: './users-resources.component.html',
  styleUrl: './users-resources.component.css'
})
export class UsersResourcesComponent implements OnInit {
  userService = inject(UserService);
  modalService = inject(ModalService);
  resourceService = inject(ResourcesService);

  organizations: IOrganizationList[] = [];

  organization: string = '';
  organizationCode: string = '';

  showForm: boolean = false;

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl('', Validators.required),
    code: new FormControl({ value: '', disabled: true }),
    firstname: new FormControl(''),
    lastname: new FormControl('', Validators.required),
    fathername: new FormControl('', Validators.required),
    mothername: new FormControl('', Validators.required),
    identity: new FormControl('', Validators.required),
    birthday: new FormControl(''),
    sex: new FormControl(''),
    dateAppointment: new FormControl(''),
    workStatus: new FormControl(''),
    workCategory: new FormControl(''),
    workSector: new FormControl(''),
    organizationalUnit: new FormControl('',Validators.required),
    organizationalUnitCode: new FormControl(''),
    building: new FormControl(''),
    office: new FormControl(''),
    phoneWork: new FormControl(''),
    emailWork: new FormControl('', Validators.email),
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

  newUserResources(data: IOrganizationList) {
    this.organization = data.preferredLabel
    this.organizationCode = data.code
    console.log(this.organization, this.organizationCode);
    this.form.controls.organization.setValue(this.organization);
    this.form.controls.organizationCode.setValue(this.organizationCode);
    // this.getFacilitiesByOrganizationCode()
    this.showForm = true;
    // this.showGrid = true;
  }

  showUserResourcesGrid(data: IOrganizationList) {
    console.log(data)
    // this.organizationCode = data.code
    // this.showGrid = true;
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

    const employeeData = this.form.getRawValue() as unknown as IEmployee;
    console.log('Form Value:', employeeData);
    
    if (this.form.valid) {
      console.log('Form Value:', employeeData); // getRawValue includes disabled fields
      this.resourceService.newEmployee(employeeData)
    }  
  }

  hasUserResourcesAdminRole() {
    return this.userService.hasUserResourcesAdminRole()
  }

  hasUserResourcesEditorRole() {
    return this.userService.hasUserResourcesEditorRole()
  }
}
