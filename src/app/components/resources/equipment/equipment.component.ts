import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';

import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IEquipmentConfig } from 'src/app/shared/interfaces/equipment/equipmentConfig';


@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    CommonModule,
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
  equipmentConfig: IEquipmentConfig[] = [];
  type: string[] = [];
  kind: string[] = [];
  category: string[] = [];
  values: string[] = [];

  showForm = false;

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationalUnit: new FormControl({ value: '', disabled: true }),
    organizationalUnitCode: new FormControl({ value: '', disabled: true }),
    type: new FormControl('', Validators.required),
    kind: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    values: new FormArray([
      new FormGroup({
        value: new FormControl('', Validators.required),
        description:new FormControl({ value: '', disabled: true }, Validators.required),
      })
    ])
  })

  ngOnInit(): void {
    this.resourceService.getEquipmentCategories()
      .subscribe(result => {
        // console.log(result);
        // this.type = result.map(data => data.type);
        // console.log(this.type);
        this.equipmentConfig = result;
        this.type = this.getTypes()
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

  onTypeChange(event: Event) {
    const type = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.kind = this.getKinds(type);
    this.form.patchValue({ kind: '', category: '' });
    this.category = [];
    this.clearValues();
  }
  
  // selectKind(){
  //   this.form.controls.kind.setValue('');
  //   this.form.controls.category.setValue('');
  //   this.category = [];

  //   const typeSelected = this.form.controls.type.value;
  //   const selection = this.equipmentConfig
  //     .find(data => data.type===typeSelected)
  //   this.kind = selection.kind.map(data => data.type)
  // }

  onKindChange(event: Event) {
    const kind = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.category = this.getCategories(this.form.value.type, kind);
    this.form.patchValue({ category: '' });
    this.clearValues();
    this.values = [];
  }

  // selectCategory(){
  //   this.form.controls.category.setValue('');
  //   this.form.controls.values.setValue([{
  //     value: '',
  //     description:''     
  //   }]);
  //   this.values = [];
    
  //   const typeSelected = this.form.controls.type.value;
  //   const kindSelected = this.form.controls.kind.value;
    
  //   const typeDoc = this.equipmentConfig
  //     .find( data => data.type === typeSelected)
  //   const kindDoc = typeDoc.kind.find(data => data.type === kindSelected) 
  //   this.category = kindDoc.category;
  // }

  onCategoryChange(event: Event){
    const category = (event.target as HTMLSelectElement).value.split(':')[1].trim(); 
    this.values = this.getValues(this.form.value.type, this.form.value.kind, category);
    this.setValueFields(this.values);
  }
  
  // selectValue(){
  //   const typeSelected = this.form.controls.type.value;
  //   const kindSelected = this.form.controls.kind.value;
  //   const categroyrSelected = this.form.controls.category.value;
    
  //   console.log("Category", categroyrSelected)

  //   const typeDoc = this.equipmentConfig
  //     .find( data => data.type === typeSelected);
  //   const kindDoc = typeDoc.kind.find(data => data.type === kindSelected);
  //   const valuesDoc = kindDoc.values.find(data => data.category === categroyrSelected);
  //   this.values = valuesDoc.values;

  //   console.log("valuesDoc1", valuesDoc);
  //   console.log("valuesDoc2", this.values);
  // }

  showOrganizationDetails(code: string): void {
    this.modalService.showOrganizationDetails(code);
  }

  hasEquipmentAdminRole() {
    return this.userService.hasEquipmentAdminRole
  }

  hasEquipmentEditorRole() {
    return this.userService.hasEquipmentEditorRole()
  }

  getTypes() {
    return this.equipmentConfig.map(data => data.type); // top-level type
  }

  getKinds(type: string) {
    const typeDoc = this.equipmentConfig
      .find(data => data.type===type)
    return typeDoc.kind.map(data => data.type);
  }

  getCategories(type: string, kindType: string) {
    const typeDoc = this.equipmentConfig
      .find( data => data.type === type)
    const kindDoc = typeDoc.kind.find(data => data.type === kindType) 
    return kindDoc.category;
  }
  
  getValues(type: string, kindType: string, category: string) {
    const typeDoc = this.equipmentConfig
      .find( data => data.type === type.trim());
    const kindDoc = typeDoc.kind.find(data => data.type === kindType);
    const valuesDoc = kindDoc.values.find(data => data.category === category);
    return valuesDoc.values
  }

  get valuesFormArray() {
    return this.form.get('values') as FormArray;
  }

  setValueFields(values: string[]) {
    this.clearValues();
    values.forEach(v => {
      const [description] = v.split('=');
      this.valuesFormArray.push(
        new FormGroup({
          value: new FormControl('', Validators.required),
          description: new FormControl({ value: description.trim(), disabled: true }, Validators.required)
        })
      );
    });
  }

  clearValues() {
    this.valuesFormArray.clear();
  }

  resetForm(){
    this.initializeForm(); 
  }

  submitForm(){
    console.log(this.form.value)
    // const data = this.form.value as IEquipmentConfig;
    // data["organization"] = this.organization;
    // data["organizationCode"] = this.organizationCode;

    // data["organizationalUnit"] = this.organizationalUnit;
    // data["organizationalUnitCode"] = this.organizationalUnitCode;

    // this.resourcesService.newFacility(data)
    //   .subscribe(response => {
    //     const body = response.body;          
    //     const status = response.status;        
    //     if (status === 201) {
    //       this.getFacilitiesByOrganizationCode();
    //     }
    //   })
  }

  initializeForm(): void {
    this.form.controls.organizationalUnit.setValue('');
    this.form.controls.organizationalUnitCode.setValue('');
    this.form.patchValue({
      organization: '',
      organizationCode: '',
      organizationalUnit: '',
      organizationalUnitCode: '',
      type: '',
      kind: '',
      category:'',
      values: [{
        value: '',
        description: ''
      }]
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
  };

}
