import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ColDef, GridApi, GridReadyEvent, CellClickedEvent, RowClickedEvent, FirstDataRenderedEvent } from 'ag-grid-community';
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
    GridLoadingOverlayComponent
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css'
})
export class EquipmentComponent implements OnInit {
   @ViewChild('resourceSubcategoryField') resourceSubcategoryField!: ElementRef<HTMLSelectElement>;

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
  selectedSpaceIds: string = '';
  equipments: IEquipment[] | null = [];

  organization: string = '';
  organizationCode: string = '';
  organizationalUnit: string = '';
  organizationalUnitCode: string = ''
  
  resourceSubcategory: string[] = [];
  kind: string[] = [];
  type: string[] = [];
  itemDescription: string[] = [];

  showForm = false;
  showOtherField = false;
  showGrid = false;
  showGridEquipment = false;
  readOnlyMode = false;
  updateEquipment: IEquipment | null;

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
    hostingFacility: new FormControl(''),
    spaceWithinFacility: new FormControl(''),
    resourceCategory:new FormControl ('Εξοπλισμός'),
    resourceSubcategory: new FormControl('', Validators.required),
    kind: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    itemDescription: new FormArray([
      new FormGroup({
        value: new FormControl('', Validators.required),
        description:new FormControl('', Validators.required),
        info: new FormControl('', Validators.required)
      })
    ]),
    itemQuantity: new FormArray([
      new FormGroup({
        distinctiveNameOfFacility: new FormControl('', Validators.required),
        facilityId: new FormControl('', Validators.required),
        spaceName: new FormControl('', Validators.required),
        spaceId: new FormControl('', Validators.required),
        quantity: new FormControl(0, Validators.required),
        codes: new FormControl(''),
      })
    ]),
    acquisitionDate: new FormControl('', Validators.required),
    depreciationDate: new FormControl(''),
    status: new FormControl('', Validators.required),
  })

  ngOnInit(): void {
    this.resourcesService.getEquipmentCategories()
      .subscribe(result => {
        this.equipmentConfig = result;
        this.resourceSubcategory = this.getResourceSubcategory()
      })
    this.organizations= this.userService.getMyEquipments();
  }

  newEquipment(data: IOrganizationList) {
    this.showForm = false;
    this.initializeForm()
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
    this.showGridEquipment = false;

    setTimeout(() => {
      this.resourceSubcategoryField?.nativeElement.focus();
    })
  }    
  
  showEquipments(code: string){
    this.showForm = false;
    this.equipments = []

    setTimeout(() => {
      if (this.gridApiEquipment) {
        this.gridApiEquipment.showLoadingOverlay();
      }
    });

    this.resourcesService.getEquipmentsByOrganizationCode(code)
    .subscribe({
      next: (response) => {
        const body = response.body['data'];
        const status = response.status;

        if (status === 200) {
          this.equipments = body;
          this.showGridEquipment = true;
        }

        if (this.gridApiEquipment) {
          if (this.equipments.length > 0) {
            this.gridApiEquipment.hideOverlay();
          } else {
            this.gridApiEquipment.showNoRowsOverlay();
          }
        }
      },
      error: () => {
        if (this.gridApiEquipment) {
          this.gridApiEquipment.showNoRowsOverlay();
        }
      },
    });
  }

  onGridReady(params: GridReadyEvent<ISpace>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    // if (this.spaces.length > 0)
    //   this.gridApi.hideOverlay();
  }


  onRowSelected(event: RowClickedEvent): void {
    const selectedNodes = event.api.getSelectedNodes();
    this.selectedSpaces = selectedNodes.map(node => node.data);
    // this.setfrmSpaceFieldsId();
    this.setitemQuantityFields();
  }

  onFirstDataRendered(params: FirstDataRenderedEvent): void {
    if (!this.gridApi) return;

    this.gridApi.forEachNode((node) => {
      // if (this.selectedSpaceIds.includes(node.data.spaces._id["$oid"])) {
      if (this.selectedSpaceIds["$oid"] === node.data.spaces._id["$oid"]) {
        node.setSelected(true);
      }
    });
  }

  onGridEquipmentReady(params: GridReadyEvent<IEquipment>): void {
    this.gridApiEquipment = params.api;
    // this.gridApiEquipment.showLoadingOverlay();
    if (this.equipments.length > 0) {
      this.gridApiEquipment.hideOverlay();
    } else {
      this.gridApiEquipment.showNoRowsOverlay();
    }
  }

  onCellEquipmentClicked(event: CellClickedEvent): void {
    this.showForm = false;
    const action = (event.event.target as HTMLElement).getAttribute('data-action');
    if (!action) return;
        
    if (action === 'editEquipment') {
      this.editEquipment(event.data);
    } else if (action === 'showEquipment'){
      this.showEquipment(event.data);
    } else if (action === 'deleteEquipment') {
      this.deleteEquipment(event.data)
    } 
  }

  showEquipment(data: IEquipment){
    // reuse your editFacility logic to populate the form
    this.editEquipment(data);

    // disable the entire form after patching
    setTimeout(() => {
      this.form.disable();
    });
    
    this.readOnlyMode = true; // activate readonly mode
  }
  
  editEquipment(data: IEquipment){
    this.readOnlyMode = false; // editing mode
    this.initializeForm()
    this.form.enable(); // ensure form is editable
    this.organization = data.organization
    this.organizationCode = data.organizationCode
    
    this.form.patchValue({
      organization: data.organization,
      organizationCode: data.organizationCode,
      resourceSubcategory: data.resourceSubcategory,
      kind: data.kind,
      type: data.type,
      acquisitionDate: new Date(data.acquisitionDate["$date"]).toISOString().split('T')[0],
      status: data.status
    });

    this.showForm = true;
    this.kind = this.getKinds(data.resourceSubcategory);
    this.type = this.getTypes(data.resourceSubcategory, data.kind);
    this.itemDescription = this.getItemDescriptions(data.resourceSubcategory, data.kind, data.type);
    this.clearitemDescription();

    this.updateEquipment = data;
    
    data.itemDescription.forEach(v => {
      this.itemDescriptionFormArray.push(
        new FormGroup({
          value: new FormControl(v.value, Validators.required),
          description: new FormControl( v.description.trim(), Validators.required),
          info: new FormControl( v.info.trim(), Validators.required),
        })
      );
    })

    data.itemQuantity.forEach(v => {
      this.itemQuantityFormArray.push(
        new FormGroup({
          distinctiveNameOfFacility: new FormControl(v.distinctiveNameOfFacility, Validators.required),
          facilityId: new FormControl( v.facilityId["$oid"], Validators.required),
          spaceName: new FormControl(v.spaceName, Validators.required),
          spaceId: new FormControl( v.spaceId["$oid"], Validators.required),
          quantity: new FormControl(v.quantity, Validators.required),
          codes: new FormControl(v.codes)
        })
      )
    })

    this.resourcesService.getSpacesByOrganizationCode(data.organizationCode)
      .subscribe(response => {
        const body = response.body;          
        const status = response.status;        
        if (status === 200) {
          this.spaces = body["data"];
          this.showGrid = true;
          // this.selectedSpaceIds = data.spaceWithinFacility.map(item => item["$oid"]);
          this.selectedSpaceIds = data.spaceWithinFacility["$oid"];
          
          setTimeout(() => {
            if (!this.gridApi) return;
            
            this.clearSelections();
            this.gridApi.forEachNode((node) => {
              // if (this.selectedSpaceIds.includes(node.data.spaces._id["$oid"])) {
              if (this.selectedSpaceIds === node.data.spaces._id["$oid"]) {
                node.setSelected(true);
              }
            });
          }, 50) // 50ms delay to wait for grid to stabilize

          if (this.readOnlyMode) {
            setTimeout(() => {
              this.gridApi.forEachNode((node) => {
                node.selectable = false; // Disable checkbox for unselected rows
              });
            }, 50)
          }
        }
      })

    setTimeout(() => {
      this.resourceSubcategoryField?.nativeElement.focus();
    });
  }

  deleteEquipment(data: IEquipment){
    const equipmentId =  data["_id"]["$oid"];
    this.modalService.getUserConsent(
      "Πρόκειται να διαγράψετε κάποιον εξοπλισμό. Επιβεβαιώστε ότι θέλετε να συνεχίσετε."
    )
    .subscribe((result) => {
      if (result) {
        this.resourcesService.deleteEquipmentById(equipmentId)
          .subscribe(response => {
            const body = response.body;          
            const status = response.status;        
            if (status === 201) {
              this.equipments = this.equipments.filter(obj => obj["_id"]["$oid"] != equipmentId)
            }
          })
      }
    })
  }

  clearSelections() {
    if (this.gridApi) {
      this.gridApi.deselectAll(); // Clear all selected rows
      this.gridApi.setFilterModel(null);
    }
  }

  onResourcesubcategoryChange(event: Event) {
    const resourcesubcategory = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.kind = this.getKinds(resourcesubcategory);
    this.form.patchValue({ kind: '', type: '' });
    this.type = [];
    this.clearitemDescription();
  }
  
  onKindChange(event: Event) {
    const kind = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.type = this.getTypes(this.form.value.resourceSubcategory, kind);
    this.form.patchValue({ type: '' });
    this.clearitemDescription();
    this.itemDescription = [];
  }

  onTypeChange(event: Event){
    const type = (event.target as HTMLSelectElement).value.split(':')[1].trim(); 
    this.itemDescription = this.getItemDescriptions(this.form.value.resourceSubcategory, this.form.value.kind, type);
    
    if (type==='Άλλο (προσδιορίστε)'){
      this.itemDescription = ['Άλλο (προσδιορίστε)']
      this.showOtherField = true;
      this.setOtherFields();
    } else {
      this.showOtherField = false;
      this.setitemDescriptionFields(this.itemDescription);
    }
  }
  
  showOrganizationDetails(code: string): void {
    this.showForm = false;
    this.modalService.showOrganizationDetails(code);
  }

  hasEquipmentAdminRole() {
    return this.userService.hasEquipmentAdminRole
  }

  hasEquipmentEditorRole() {
    return this.userService.hasEquipmentEditorRole()
  }

  getResourceSubcategory() {
    return this.equipmentConfig.map(data => data.resourceSubcategory); 
  }

  getKinds(resourceSubcategory: string) {
    const resourcecategoryDoc = this.equipmentConfig
      .find(data => data.resourceSubcategory===resourceSubcategory)
    return resourcecategoryDoc.kind.map(data => data.name);
  }

  getTypes(resourceSubcategory: string, kindName: string) {
    const resourceSubcategoryDoc = this.equipmentConfig
      .find( data => data.resourceSubcategory === resourceSubcategory)
    const kindDoc = resourceSubcategoryDoc.kind.find(data => data.name === kindName) 
    return kindDoc.type.map(data => data.name);
  }
  
  getItemDescriptions(resourceSubcategory: string, kindName: string, type: string) {
    const resourceSubcategoryDoc = this.equipmentConfig
      .find( data => data.resourceSubcategory === resourceSubcategory.trim());
    const kindDoc = resourceSubcategoryDoc.kind.find(data => data.name === kindName);
    const typeDoc = kindDoc.type.find(data => data.name === type)
    return typeDoc.itemDescription
  }

  get itemDescriptionFormArray() {
    return this.form.get('itemDescription') as FormArray;
  }

  setitemDescriptionFields(itemDescription: string[]) {
    this.clearitemDescription();
    itemDescription.forEach(v => {
      const [description, info] = v.split('=');
      this.itemDescriptionFormArray.push(
        new FormGroup({
          value: new FormControl('', Validators.required),
          description: new FormControl( description.trim(), Validators.required),
          info: new FormControl( info.trim(), Validators.required),
        })
      );
    });
  }

  setOtherFields() {
    this.clearitemDescription();
    this.itemDescriptionFormArray.push(
      new FormGroup({
        value: new FormControl('', Validators.required),
        description: new FormControl({ value: "Άλλο (προσδιορίστε)", disabled: true }, Validators.required),
        info: new FormControl({ value: "", disabled: true }, Validators.required),
      })      
    );
  }

  clearitemDescription() {
    this.itemDescriptionFormArray.clear();
  }

  // get frmSpaceFieldsId() {
  //   return this.form.get('spaceWithinFacility') as FormArray;
  // }

  // setfrmSpaceFieldsId() {
  //   this.clearfrmSpaceFieldsId();
  //   this.selectedSpaces.forEach(data => {
  //     this.frmSpaceFieldsId.push(
  //       new FormGroup({
  //         id: new FormControl(data.spaces._id.$oid, Validators.required),
  //       })
  //     )
  //   })
  // }

  // clearfrmSpaceFieldsId() {
  //   this.frmSpaceFieldsId.clear();
  // }

  getfrmSpaceFieldsId() {
    return this.selectedSpaces.map(data => data.spaces._id.$oid)
  }

  get itemQuantityFormArray() {
    return this.form.get('itemQuantity') as FormArray;
  }

  setitemQuantityFields() {
    this.clearitemQuantity();
    this.selectedSpaces.forEach(v => {
      let quantity = null;
      let codes = "";
      
      if (this.updateEquipment && this.updateEquipment.itemQuantity) {
        const match = this.updateEquipment.itemQuantity.find(item => {
          return item.spaceId?.["$oid"] === v.spaces._id?.["$oid"];
        });

        if (match) {
          quantity = match.quantity;
          codes = match.codes;
        }
      }
  
      this.itemQuantityFormArray.push(
        new FormGroup({
          distinctiveNameOfFacility: new FormControl(v.distinctiveNameOfFacility, Validators.required),
          facilityId: new FormControl( v["_id"]["$oid"], Validators.required),
          spaceName: new FormControl(v.spaces.spaceName, Validators.required),
          spaceId: new FormControl( v.spaces._id.$oid, Validators.required),
          quantity: new FormControl(quantity, Validators.required),
          codes: new FormControl(codes)
        })
      );
    });
  }

  clearitemQuantity() {
    this.itemQuantityFormArray.clear();
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

    const equipmentsSubmited = [];

    for (let item of this.form.controls.itemQuantity.value) {
      
      const quantity = item.quantity;
      const codes = item.codes ? item.codes.split('$') : [];

      for (let i = 0; i < quantity; i++) {
        const data: IEquipment = {
          organization: this.organization,
          organizationCode: this.organizationCode,
          hostingFacility: item.facilityId,
          spaceWithinFacility: item.spaceId,
          resourceCategory: this.form.controls.resourceCategory.value,
          resourceSubcategory: this.form.controls.resourceSubcategory.value,
          kind: this.form.controls.kind.value,
          type: this.form.controls.type.value,
          itemDescription: this.form.controls.itemDescription.value as { value: string; description: string; info: string }[],
          itemQuantity: [{
            distinctiveNameOfFacility: item.distinctiveNameOfFacility,
            facilityId: item.facilityId,
            spaceName: item.spaceName,
            spaceId: item.spaceId,
            quantity: 1,  // Only one per code
            codes: codes[i] ? codes[i] : "-"
          }],
          acquisitionDate: this.form.controls.acquisitionDate.value,
          depreciationDate: '',
          status: this.form.controls.status.value
        };
        equipmentsSubmited.push(data)
      }           
    }
    
    if (this.updateEquipment) {
      let updateEquipment = equipmentsSubmited[0]
      updateEquipment["_id"] = this.updateEquipment["_id"]["$oid"];
      this.resourcesService.modifyEquipment(updateEquipment)
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 201) {
            this.initializeForm()
            this.showEquipments(this.organizationCode);
            this.showForm = false;
          }
        })
    } else {
      this.resourcesService.addEquipment(equipmentsSubmited)
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 201) {
            this.initializeForm()
            this.showEquipments(this.organizationCode);
            this.showForm = false;
          }
        })
    }
  }

  initializeForm(): void {
    this.form.patchValue({
      organization: '',
      organizationCode: '',
      hostingFacility: '',
      spaceWithinFacility: '',
      resourceSubcategory: '',
      kind: '',
      type:'',
      itemDescription: [{
        value: '',
        description: '',
        info:''
      }],
      acquisitionDate: '',
      status: ''
    });
    this.clearitemDescription();
    this.clearitemQuantity()
    // this.clearfrmSpaceFieldsId();
    this.clearSelections();
    this.selectedSpaces = [];
    this.selectedSpaceIds = ""
    this.updateEquipment = null;

    this.form.markAsPristine();
    this.form.markAsUntouched();
  };
}