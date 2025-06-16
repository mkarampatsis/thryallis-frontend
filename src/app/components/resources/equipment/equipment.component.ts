import { Component, inject, OnInit } from '@angular/core';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';

import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { IOrganizationList } from 'src/app/shared/interfaces/organization';


@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgbTooltipModule
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css'
})
export class EquipmentComponent implements OnInit {
  userService = inject(UserService);
  resourceService = inject(ResourcesService)
  modalService = inject(ModalService);

  organizations: IOrganizationList[] = [];
  organization: string = '';
  organizationCode: string = '';
  organizationalUnit: string = '';
  organizationalUnitCode: string = ''
  type: string[];

  showForm = false;

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationalUnit: new FormControl({ value: '', disabled: true }),
    organizationalUnitCode: new FormControl({ value: '', disabled: true }),
    type: new FormControl('', Validators.required),
    kind: new FormControl({ value: '', disabled: true }, Validators.required),
  })

  ngOnInit(): void {
    this.resourceService.getEquipmentCategories()
      .subscribe(result => {
        console.log(result);
        this.type = result.map(data => data.type);
        console.log(this.type);
      })
    this.organizations= this.userService.getMyEquipments();
  }

  newEquipment(data: IOrganizationList) {
    this.organization = data.preferredLabel
    this.organizationCode = data.code
    this.form.controls.organization.setValue(this.organization);
    this.form.controls.organizationCode.setValue(this.organizationCode);
    // this.getFacilitiesByOrganizationCode()
    this.showForm = true;
    // this.showGrid = true;
  }

  chooseOrganizationalUnit(){
    this.modalService.showOrganizationUnitsByOrganizationCode(this.organizationCode)
      .subscribe(result => {
        this.organizationalUnit = result.preferredLabel;
        this.organizationalUnitCode = result.code;
        this.form.controls.organizationalUnit.setValue(this.organizationalUnit);
        this.form.controls.organizationalUnitCode.setValue(this.organizationalUnitCode);
      })
  }

  selectKind(event: Event){
    console.log(event);
    this.type.filter(data => data)
  }

  showOrganizationDetails(code: string): void {
    this.modalService.showOrganizationDetails(code);
  }

  hasEquipmentAdminRole() {
    return this.userService.hasEquipmentAdminRole
  }

  hasEquipmentEditorRole() {
    return this.userService.hasEquipmentEditorRole()
  }

}
