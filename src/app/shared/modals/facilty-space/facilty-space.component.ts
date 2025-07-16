import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConstFacilityService } from '../../services/const-facility.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { ResourcesService } from '../../services/resources.service';

import { IFacility, ISpace } from '../../interfaces/facility/facility';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { AgGridNoRowsOverlayComponent } from 'src/app/shared/components/ag-grid-no-rows-overlay/ag-grid-no-rows-overlay.component';

import { selectOrganizationalUnitByOrganizationCode$, } from 'src/app/shared/state/organizational-units.state';
import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';

import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { Observable, Subscription, take } from 'rxjs';
import { TmplAstSwitchBlockCase } from '@angular/compiler';

@Component({
  selector: 'app-facilty-space',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './facilty-space.component.html',
  styleUrl: './facilty-space.component.css'
})
export class FaciltySpaceComponent implements OnInit {
  constFacilityService = inject(ConstFacilityService);
  constService = inject(ConstService);
  resourcesService = inject(ResourcesService);

  store = inject(Store<AppState>);
  organizational_units$ = selectOrganizationalUnitByOrganizationCode$

  modalRef: any;
  facility: IFacility;
  space: ISpace;

  organization: string;
  organizationCode: string;
  distinctiveNameOfFacility: string
  selectedOrganizationalCodes: string[];
  auxiliarySpace: boolean = false;

  types: string[] = [];
  subtypes: string[] = [];
  spaces: string[] = [];
  SPACE_USE = this.constFacilityService.SPACE_USE
  AUXILIARY_SPACES = this.constFacilityService.AUXILIARY_SPACES
  FLOORPLANS = this.constFacilityService.FLOORPLANS;
  planFloorsNumField: number = 0;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = this.constService.ORGANIZATION_UNITS_COL_DEFS_CHECKBOXES
  autoSizeStrategy = this.constService.autoSizeStrategy;
  gridApi: GridApi<IOrganizationUnitList>;
  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };
  selectedData = [];

  monades: IOrganizationUnitList[] = [];
  subscriptions: Subscription[] = [];
  
  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
  organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

  form = new FormGroup({
    facilityId: new FormControl(''),
    organizationalUnit: new FormArray([
      new FormGroup({
        organizationalUnit: new FormControl('', Validators.required),
        organizationalUnitCode: new FormControl('', Validators.required)
      })
    ]),
    spaceName: new FormControl('', Validators.required),
    spaceUse: new FormGroup({
      type: new FormControl({ value: '', disabled: true }, Validators.required),
      subtype: new FormControl(''),
      space: new FormControl('', Validators.required),
    }),
    auxiliarySpace: new FormControl(false),
    spaceArea: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    spaceLength: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    spaceWidth: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    entrances: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    windows: new FormControl('', [Validators.required, Validators.pattern(/^\d+?$/)]),
    floorPlans: new FormGroup({
      level: new FormControl('', Validators.required),
      num: new FormControl('', Validators.required),
    })
  })

  ngOnInit() {
    this.organization = this.facility ? this.facility.organization : this.space.facilityId["organization"];
    this.organizationCode = this.facility ? this.facility.organizationCode : this.space.facilityId["organizationCode"];
    this.distinctiveNameOfFacility = this.facility ? this.facility.distinctiveNameOfFacility : this.space.facilityId["distinctiveNameOfFacility"];
    this.types = this.SPACE_USE.map(d => d.type);
    this.initializeForm();
    this.onTypeChange();
    if (this.space) {
      this.editSpace(this.space);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onGridReady(params: GridReadyEvent<IOrganizationUnitList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.subscriptions.push(
      this.store.select(this.organizational_units$(this.organizationCode)).subscribe((data) => {
        this.monades = data.map((org) => {
          return {
            ...org,
            organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
            organization: this.organizationCodesMap.get(org.organizationCode),
            subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
          };
        });
        this.gridApi.hideOverlay();
      }),
    )
  }

  onRowSelected(event: any) {
    const selectedNodes = event.api.getSelectedNodes();
    // Log selected rows to the console
    this.selectedData = selectedNodes.map(node => node.data);
    this.setOrganizationalUnitFormArray(this.selectedData);
  }

   onFirstDataRendered(params: any): void {
    if (!this.gridApi) return;

    this.gridApi.forEachNode((node) => {
      if (this.selectedOrganizationalCodes.includes(node.data.code)) {
        node.setSelected(true);
      }
    });
  }

  clearSelection() {
    if (this.gridApi) {
      this.gridApi.deselectAll(); // Clear all selected rows
      this.gridApi.setFilterModel(null);
    }
  }

  get organizationalUnitFormArray() {
    return this.form.get('organizationalUnit') as FormArray;
  }

  setOrganizationalUnitFormArray(item: IOrganizationUnitList[]) {
    this.clearOrganizationalUnitFormArray();
    item.forEach(v => {
      this.organizationalUnitFormArray.push(
        new FormGroup({
          organizationalUnit: new FormControl(v.preferredLabel, Validators.required),
          organizationalUnitCode: new FormControl(v.code, Validators.required)
        })
      );
    });
  }

  clearOrganizationalUnitFormArray() {
    this.organizationalUnitFormArray.clear();
  }

  initializeForm() {
    const facilityId = this.facility ? this.facility["_id"]["$oid"] : this.space.facilityId["id"];
    const spaceUseType = this.facility ? this.facility.useOfFacility : this.space.spaceUse.type;
    this.form.patchValue({
      facilityId: facilityId,
      spaceName: '',
      spaceUse: {
        type: spaceUseType,
        subtype: '',
        space: '',
      },
      auxiliarySpace: false,
      spaceArea: '',
      spaceLength: '',
      spaceWidth: '',
      entrances: '',
      windows: '',
      floorPlans: {
        level: '',
        num: ''
      }
    })

    this.clearOrganizationalUnitFormArray();
    this.clearSelection();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  
  onTypeChange(): void {
    this.form.controls.spaceUse.patchValue({ subtype: '', space: '' });
    this.spaces = [];
    this.subtypes = [];

    const selectedType = this.form.controls.spaceUse.get('type')?.value;
    const selectedItem = this.SPACE_USE.find(d => d.type === selectedType);

    if (!selectedItem) return;

    const isDirectSpaces = selectedItem.spaces.every(s => typeof s === 'string');

    if (isDirectSpaces) {
      this.spaces = selectedItem.spaces as string[];
    } else {
      this.subtypes = (selectedItem.spaces as any[]).map(sub => sub.type);
    }
  }

  onSubtypeChange(): void {
    this.form.controls.spaceUse.patchValue({ space: '' });
    this.spaces = [];

    const selectedType = this.form.controls.spaceUse.get('type')?.value;
    const selectedSubtype = this.form.controls.spaceUse.get('subtype')?.value;
    const selectedItem = this.SPACE_USE.find(d => d.type === selectedType);

    if (!selectedItem || !Array.isArray(selectedItem.spaces)) return;

    const subtypeItem = (selectedItem.spaces as any[]).find(sub => sub.type === selectedSubtype);
    if (subtypeItem) {
      this.spaces = subtypeItem.spaces;
    }
  }

  selectLevel(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value.split(':')[1].trim();

    const selectedOption = this.form.controls.floorPlans.get('level')?.value;

    if (value == 'Όροφος') {
      this.form.controls.floorPlans.get('num').setValue('1')
      this.planFloorsNumField = 1;
    } else if (value == 'Ισόγειο') {
      this.form.controls.floorPlans.get('num').setValue('0')
      this.planFloorsNumField = 2;
    } else if (value == 'Υπόγειο') {
      this.form.controls.floorPlans.get('num').setValue('-1')
      this.planFloorsNumField = 3;
    } else if (value == 'Ημιυπόγειο' || value == 'Ημιόροφος' || value == 'Ταράτσα') {
      this.planFloorsNumField = 4;
      this.form.controls.floorPlans.get('num').setValue('-')
    } else {
      this.planFloorsNumField = 0;
    }
  }

  onAuxiliarySpaceChange(status:boolean){
    return this.auxiliarySpace = status? true: false;
  }

  editSpace(space: ISpace){
    this.form.patchValue({
      facilityId: this.space.facilityId,
      spaceName: this.space.spaceName,
      spaceUse: {
        type: this.space.spaceUse.type,
        subtype: this.space.spaceUse.subtype,
        space: this.space.spaceUse.space,
      },
      auxiliarySpace: this.space.auxiliarySpace,
      spaceArea: this.space.spaceArea,
      spaceLength: this.space.spaceLength,
      spaceWidth: this.space.spaceWidth,
      entrances: this.space.entrances,
      windows: this.space.windows,
      floorPlans: {
        level: this.space.floorPlans.level,
        num: this.space.floorPlans.num
      }
    })

    this.auxiliarySpace = this.space.auxiliarySpace;

    const floorLevel = this.space.floorPlans.level
    if (floorLevel == 'Όροφος') {
      this.planFloorsNumField = 1;
    } else if (floorLevel == 'Ισόγειο') {
      this.planFloorsNumField = 2;
    } else if (floorLevel == 'Υπόγειο') {
      this.planFloorsNumField = 3;
    } else if (floorLevel == 'Ημιυπόγειο' || floorLevel == 'Ημιόροφος' || floorLevel == 'Ταράτσα') {
      this.planFloorsNumField = 4;
    } else {
      this.planFloorsNumField = 0;
    }

    this.selectedOrganizationalCodes = this.space.organizationalUnit.map(item => item.organizationalUnitCode)
  }

  submitForm() {
    const data = this.form.value as ISpace;
    data["facilityId"] = this.facility ? this.facility["_id"]["$oid"] : this.space.facilityId["id"];
    data["spaceUse"]["type"] = this.facility ? this.facility.useOfFacility : this.space.spaceUse.type;
    data["organizationalUnit"] = this.form.controls.organizationalUnit.value as { organizationalUnit: string; organizationalUnitCode: string; }[];

    if (this.space){
      data["id"] = this.space["id"]
      this.resourcesService.modifySpace(data)
        .subscribe(result => {
          this.modalRef.dismiss(result);
        })
    } else {
      this.resourcesService.addSpace(data)
        .subscribe(result => {
          this.modalRef.dismiss(result);
        })
      }
  }

  resetForm() {
    this.initializeForm();
  }
}
