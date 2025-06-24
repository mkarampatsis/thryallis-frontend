import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { AgGridNoRowsOverlayComponent } from 'src/app/shared/components/ag-grid-no-rows-overlay/ag-grid-no-rows-overlay.component';

import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ModalService } from 'src/app/shared/services/modal.service';

import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IEquipmentConfig } from 'src/app/shared/interfaces/equipment/equipmentConfig';
import { IFacility, ISpace } from 'src/app/shared/interfaces/facility/facility';


@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    AgGridAngular,
    AgGridNoRowsOverlayComponent,
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css'
})
export class EquipmentComponent implements OnInit {
  userService = inject(UserService);
  resourceService = inject(ResourcesService)
  modalService = inject(ModalService);
  constFacilityService = inject(ConstFacilityService);
  constService = inject(ConstService);

  organizations: IOrganizationList[] = [];
  equipmentConfig: IEquipmentConfig[] = [];
  facilities: IFacility[] | null = [];
  spaces: ISpace[] | null = [];

  organization: string = '';
  organizationCode: string = '';
  organizationalUnit: string = '';
  organizationalUnitCode: string = ''
  
  type: string[] = [];
  kind: string[] = [];
  category: string[] = [];
  values: string[] = [];

  showForm = false;
  showOtherField = false;
  showGrid = false;
  loading = false;

  autoSizeStrategy = this.constFacilityService.autoSizeStrategy;
  defaultColDef = this.constFacilityService.defaultColDef;
  spaceColDefs: ColDef[] = this.constFacilityService.SPACE_EQUIPMENT_COL_DEFS;
  
  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationalUnit: new FormArray([
      new FormGroup({
        organizationalUnit: new FormControl({ value: '', disabled: true }),
        organizationalUnitCode: new FormControl({ value: '', disabled: true }),
      })
    ]),
    facilityId: new FormArray([
      new FormGroup({
        facilityId: new FormControl('', Validators.required) 
      })
    ]),
    type: new FormControl('', Validators.required),
    kind: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    values: new FormArray([
      new FormGroup({
        value: new FormControl('', Validators.required),
        description:new FormControl({ value: '', disabled: true }, Validators.required),
        info: new FormControl({ value: '', disabled: true }, Validators.required)
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
    this.resourceService.getSpacesByOrganizationCode(this.organizationCode)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        console.log(response)
        if (status === 200) {
          this.spaces = body;
          console.log(this.spaces);
          this.showGrid = true
        }
      })
  }

  chooseOrganizationalUnit(){
    this.modalService.showOrganizationUnitsByOrganizationCode(this.organizationCode)
      .subscribe(result => {
        console.log(result);
        // this.facilities.push(result);
        this.organizationalUnit = result.preferredLabel;
        this.organizationalUnitCode = result.code;
        // this.setOrganizationalUnitsFields(result.preferredLabel, result.code)
      })
  }

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    if (this.spaces.length > 0)
      this.gridApi.hideOverlay();
  }


  onCellClicked(event: CellClickedEvent): void {
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    console.log(action)
  }

  onTypeChange(event: Event) {
    const type = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.kind = this.getKinds(type);
    this.form.patchValue({ kind: '', category: '' });
    this.category = [];
    this.clearValues();
  }
  
  onKindChange(event: Event) {
    const kind = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.category = this.getCategories(this.form.value.type, kind);
    this.form.patchValue({ category: '' });
    this.clearValues();
    this.values = [];
  }

  onCategoryChange(event: Event){
    const category = (event.target as HTMLSelectElement).value.split(':')[1].trim(); 
    this.values = this.getValues(this.form.value.type, this.form.value.kind, category);
    
    if (category==='Άλλο (προσδιορίστε)'){
      this.values = ['Άλλο (προσδιορίστε)']
      this.showOtherField = true;
      this.setOtherFields();
    } else {
      this.showOtherField = false;
      this.setValueFields(this.values);
    }
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
    return kindDoc.category.map(data => data.type);
  }
  
  getValues(type: string, kindType: string, category: string) {
    const typeDoc = this.equipmentConfig
      .find( data => data.type === type.trim());
    const kindDoc = typeDoc.kind.find(data => data.type === kindType);
    const categoryDoc = kindDoc.category.find(data => data.type === category)
    return categoryDoc.values
  }

  get valuesFormArray() {
    return this.form.get('values') as FormArray;
  }

  setValueFields(values: string[]) {
    this.clearValues();
    values.forEach(v => {
      const [description, info] = v.split('=');
      this.valuesFormArray.push(
        new FormGroup({
          value: new FormControl('', Validators.required),
          description: new FormControl({ value: description.trim(), disabled: true }, Validators.required),
          info: new FormControl({ value: info.trim(), disabled: true }, Validators.required),
        })
      );
    });
  }

  setOtherFields() {
    this.clearValues();
    this.valuesFormArray.push(
      new FormGroup({
        value: new FormControl('', Validators.required),
        description: new FormControl({ value: "Άλλο (προσδιορίστε)", disabled: true }, Validators.required),
        info: new FormControl({ value: "", disabled: true }, Validators.required),
      })      
    );
  }

  clearValues() {
    this.valuesFormArray.clear();
  }

  get valuesOrganizationalUnits() {
    return this.form.get('organizationalUnit') as FormArray;
  }

  setOrganizationalUnitsFields(ouName:string, ouCode:string) {
    // this.clearOrganizationalUnits();
    this.valuesOrganizationalUnits.push(
      new FormGroup({
        organizationalUnit: new FormControl({ value: ouName.trim(), disabled: true }, Validators.required),
        organizationalUnitCode: new FormControl({ value: ouCode.trim(), disabled: true }, Validators.required),
      })
    );
  }

  clearOrganizationalUnits() {
    this.valuesOrganizationalUnits.clear();
  }

  addOrganizationalUnit() {
    this.valuesOrganizationalUnits.push(
      new FormGroup({
        organizationalUnit: new FormControl({ value: '', disabled: true }, Validators.required),
        organizationalUnitCode: new FormControl({ value: '', disabled: true }, Validators.required),
      }),
    );
  }

  removeOrganizationalUnit(index: number) {
    this.valuesOrganizationalUnits.removeAt(index);
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
    // this.form.controls.organizationalUnit.setValue('');
    // this.form.controls.organizationalUnitCode.setValue('');
    this.form.patchValue({
      organization: '',
      organizationCode: '',
      organizationalUnit: [{
        organizationalUnit: '',
        organizationalUnitCode: '',
      }],
      
      type: '',
      kind: '',
      category:'',
      values: [{
        value: '',
        description: '',
        info:''
      }]
    });

    this.clearOrganizationalUnits();
    this.clearValues();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  };

}