import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';

import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';

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

  organizations: IOrganizationList[] = [];

  organization: string = '';
  organizationCode: string = '';

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl({ value: '', disabled: true }, Validators.required),
    code: new FormControl('', Validators.required),
    firstname: new FormControl(''),
    lastname: new FormControl('', Validators.required),
    fathername: new FormControl('', Validators.required),
    mothername: new FormControl(true),
    identity: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    address: new FormGroup({
      street: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      postcode: new FormControl('', Validators.required),
      area: new FormControl('', Validators.required),
      municipality: new FormControl('', Validators.required),
      geographicRegion: new FormControl('', Validators.required),
      country: new FormControl('ΕΛΛΑΣ', Validators.required),
    }),
    phoneHome: new FormControl('', Validators.required),
    phoneMobile: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    addressWork: new FormGroup({
      street: new FormControl('', Validators.required),
      number: new FormControl('', Validators.required),
      postcode: new FormControl('', Validators.required),
      area: new FormControl('', Validators.required),
      municipality: new FormControl('', Validators.required),
      geographicRegion: new FormControl('', Validators.required),
      country: new FormControl('ΕΛΛΑΣ', Validators.required),
    }),
    phoneWork: new FormControl('', Validators.required),
    emailWork: new FormControl('', Validators.required),
    sex: new FormControl('Male', Validators.required),
    famillyStatus: new FormControl('', Validators.required),
    children: new FormArray([
      new FormGroup({
        name: new FormControl('', Validators.required),
        sex: new FormControl('', Validators.required),
        birthday: new FormControl('', Validators.required),
      })
    ]),
    workStatus: new FormControl('', Validators.required),
    education: new FormControl('', Validators.required),
    specialty: new FormGroup({
      title: new FormControl('', Validators.required),
      file: new FormControl('', Validators.required),
    }),
    office: new FormControl('', Validators.required),
    facility: new FormControl('Male', Validators.required),
    qualifications: new FormArray([
      new FormGroup({
        type: new FormControl('', Validators.required),
        title: new FormControl('', Validators.required),
        organization: new FormControl('', Validators.required),
        date: new FormControl('', Validators.required),
        file: new FormControl('', Validators.required)
      })
    ]),
    finalized: new FormControl(false)
  });

  ngOnInit() {
    this.organizations = this.userService.getMyUserResources()
  }

  showOrganizationDetails(code: string): void {
    this.modalService.showOrganizationDetails(code);
  }

  newUserResources(data: IOrganizationList) {
    this.organization = data.preferredLabel
    this.organizationCode = data.code
    this.form.controls.organization.setValue(this.organization);
    this.form.controls.organizationCode.setValue(this.organizationCode);
    // this.getFacilitiesByOrganizationCode()
    // this.showForm = true;
    // this.showGrid = true;
  }

  showUserResourcesGrid(data: IOrganizationList) {
    console.log(data)
    // this.organizationCode = data.code
    // this.showGrid = true;
  }

  get children(): FormArray {
    return this.form.get('children') as FormArray;
  }

  addChild() {
    const childGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      sex: new FormControl('', Validators.required),
      birthday: new FormControl('', Validators.required)
    });
    this.children.push(childGroup);
  }

  removeChild(index: number) {
    this.children.removeAt(index);
  }

  get qualifications(): FormArray {
    return this.form.get('qualifications') as FormArray;
  }

  addQualification() {
    const qualGroup = new FormGroup({
      type: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      organization: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      file: new FormControl('', Validators.required)
    });
    this.qualifications.push(qualGroup);
  }

  removeQualification(index: number) {
    this.qualifications.removeAt(index);
  }

  hasUserResourcesAdminRole() {
    return this.userService.hasUserResourcesAdminRole()
  }

  hasUserResourcesEditorRole() {
    return this.userService.hasUserResourcesEditorRole()
  }
}
