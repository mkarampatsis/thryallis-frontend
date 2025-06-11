import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConstFacilityService } from '../../services/const-facility.service';
import { ResourcesService } from '../../services/resources.service';

import { IFacility, ISpace } from '../../interfaces/facility/facility';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-facilty-space',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facilty-space.component.html',
  styleUrl: './facilty-space.component.css'
})
export class FaciltySpaceComponent implements OnInit {
  constFacilityService = inject(ConstFacilityService);
  resourcesService = inject(ResourcesService);
  modalRef: any;
  facility: IFacility;

  types: string[] = [];
  subtypes: string[] = [];
  spaces: string[] = [];
  SPACE_USE = this.constFacilityService.SPACE_USE
  AUXILIARY_SPACES = this.constFacilityService.AUXILIARY_SPACES
  FLOORPLANS = this.constFacilityService.FLOORPLANS;
  planFloorsNumField: number = 0;

  form = new FormGroup({
    facilityId: new FormControl(''),
    spaceName: new FormControl('', Validators.required),
    spaceUse: new FormGroup({
      type: new FormControl({value:'', disabled: true}, Validators.required),
      subtype: new FormControl(''),
      space: new FormControl('', Validators.required),
    }),    
    // auxiliarySpace: new FormControl('', Validators.required),
    spaceArea: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    spaceLength: new FormControl('',[Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    spaceWidth: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]),
    entrances: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    windows: new FormControl('', [Validators.required, Validators.pattern(/^\d+?$/)]),
    floorPlans: new FormGroup({
      level: new FormControl('', Validators.required),
      num: new FormControl('', Validators.required),
    })
  })

  ngOnInit(){
    this.types = this.SPACE_USE.map(d => d.type);
    this.initializeForm();
    this.onTypeChange();
  }

  initializeForm(){
    this.form.patchValue({
      facilityId: this.facility["_id"]["$oid"],
      spaceName: '',
      spaceUse: {
        type: this.facility.useOfFacility,
        subtype: '',
        space: '',
      },    
      // auxiliarySpace: '',
      spaceArea: '',
      spaceLength: '',
      spaceWidth: '',
      entrances: '',
      windows: '',
      floorPlans: {
        level:'',
        num:''
      }
    })
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

  submitForm(){
    // const invalid = [];
    //     const controls = this.form.controls;
    //     for (const name in controls) {
    //         if (controls[name].invalid) {
    //             invalid.push(name);
    //         }
    //     }
    //     console.log(invalid)
    //     // return invalid;
    
    const data = this.form.value as ISpace;
    data["facilityId"] = this.facility["_id"]["$oid"];
    data["spaceUse"]["type"] = this.facility.useOfFacility;
    this.resourcesService.addSpace(data)
      .subscribe(result => {
        this.modalRef.dismiss(result);
      })
  }

  resetForm(){
    this.initializeForm();
  }
}
