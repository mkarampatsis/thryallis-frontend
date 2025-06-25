import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ColDef, GridApi, GridReadyEvent, CellClickedEvent, RowClickedEvent } from 'ag-grid-community';
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
import { IFacility } from 'src/app/shared/interfaces/facility/facility';
import { IFacilitySpace } from 'src/app/shared/interfaces/facility/facility-space';
import { IEquipment } from 'src/app/shared/interfaces/equipment/equipment';


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
  resourcesService = inject(ResourcesService)
  modalService = inject(ModalService);
  constFacilityService = inject(ConstFacilityService);
  constService = inject(ConstService);

  organizations: IOrganizationList[] = [];
  equipmentConfig: IEquipmentConfig[] = [];
  facilities: IFacility[] | null = [];
  spaces: IFacilitySpace[] | null = [];
  selectedSpaces: IFacilitySpace[] = [];
  equipments: IEquipment[] | null =[];

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
  equipmentColDefs: ColDef[] = this.constFacilityService.EQUIPMENT_COL_DEFS;
  
  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

  gridApi: GridApi;
  gridApiEquipment: GridApi;

  form = new FormGroup({
    organization: new FormControl({ value: '', disabled: true }, Validators.required),
    organizationCode: new FormControl({ value: '', disabled: true }, Validators.required),
    spaceId: new FormArray([
      new FormGroup({
        id: new FormControl('', Validators.required) 
      })
    ]),
    type: new FormControl('', Validators.required),
    kind: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    values: new FormArray([
      new FormGroup({
        value: new FormControl('', Validators.required),
        description:new FormControl('', Validators.required),
        info: new FormControl('', Validators.required)
      })
    ])
  })

  ngOnInit(): void {
    this.resourcesService.getEquipmentCategories()
      .subscribe(result => {
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
    this.showForm = true;
    this.resourcesService.getSpacesByOrganizationCode(this.organizationCode)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 200) {
          this.spaces = body["data"];
          this.showGrid = true
        }
      })
  }    
  
  showEquipments(code: string){
    this.resourcesService.getEquipmentsByOrganizationCode(code)
      .subscribe(results => {
        console.log(results)
        this.equipments = results;
        if (this.spaces.length > 0)
        this.gridApiEquipment.hideOverlay();
      })
  }

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    if (this.spaces.length > 0)
      this.gridApi.hideOverlay();
  }


  onRowSelected(event: RowClickedEvent): void {
    const selectedNodes = event.api.getSelectedNodes();
    this.selectedSpaces = selectedNodes.map(node => node.data);
    this.setfrmSpaceFieldsId();
  }

  onGridEquipmentReady(params: GridReadyEvent<IEquipment>): void {
    this.gridApiEquipment = params.api;
    this.gridApiEquipment.showLoadingOverlay();
    if (this.equipments.length > 0)
      this.gridApiEquipment.hideOverlay();
  }

  clearSelections() {
    if (this.gridApi) {
      this.gridApi.deselectAll(); // Clear all selected rows
      this.gridApi.setFilterModel(null);
    }
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
          description: new FormControl( description.trim(), Validators.required),
          info: new FormControl( info.trim(), Validators.required),
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

  get frmSpaceFieldsId() {
    return this.form.get('spaceId') as FormArray;
  }

  setfrmSpaceFieldsId() {
    this.clearfrmSpaceFieldsId();
    this.selectedSpaces.forEach(data => {
      this.frmSpaceFieldsId.push(
        new FormGroup({
          id: new FormControl(data.spaces._id.$oid, Validators.required),
        })
      )
    })
  }

  clearfrmSpaceFieldsId() {
    this.frmSpaceFieldsId.clear();
  }

  getfrmSpaceFieldsId() {
    return this.selectedSpaces.map(data => data.spaces._id.$oid)
  }

  resetForm(){
    this.initializeForm(); 
  }

  submitForm(){
    // const invalid = [];
    // const controls = this.form.controls;
    // for (const name in controls) {
    //   if (controls[name].invalid) {
    //     invalid.push(name);
    //   }
    // }
    // console.log(invalid)

    const data = this.form.value as IEquipment;
    data['organization'] = this.organization;
    data['organizationCode'] = this.organizationCode;
    data['spaceId'] = this.getfrmSpaceFieldsId()
    this.resourcesService.addEquipment(data)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 201) {
          // this.getFacilitiesByOrganizationCode();
          console.log(body)
        }
      })
  }

  initializeForm(): void {
    this.form.patchValue({
      organization: '',
      organizationCode: '',
      spaceId: [{
        id:''
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
    this.clearValues();
    this.clearfrmSpaceFieldsId();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  };

}