import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConstFacilityService } from '../../services/const-facility.service';

import { IFacility } from '../../interfaces/facility/facility';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-facilty-space',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facilty-space.component.html',
  styleUrl: './facilty-space.component.css'
})
export class FaciltySpaceComponent implements OnInit {
  constFacilityService = inject(ConstFacilityService)
  modalRef: any;
  facilty: IFacility;

  types: string[] = [];
  subtypes: string[] = [];
  spaces: string[] = [];
  spaceUse = this.constFacilityService.SPACE_USE

  form = new FormGroup({
    facilityID: new FormControl('', Validators.required),
    spaceName: new FormControl('', Validators.required),
    spaceUse: new FormGroup({
      type: new FormControl('', Validators.required),
      subtype: new FormControl('', Validators.required),
      space: new FormControl('', Validators.required),
    }),    
    spaceUseTree: new FormControl('', Validators.required),
    spaceArea: new FormControl('', Validators.required),
    spaceLength: new FormControl('', Validators.required),
    spaceWidth: new FormControl('', Validators.required),
    entrances: new FormControl('', Validators.required),
    windows: new FormControl('', Validators.required),
    floor_level: new FormControl('', Validators.required)
  })

  ngOnInit(){
    this.types = this.spaceUse.map(d => d.type);
    console.log(this.types)
  }

  onTypeChange(): void {
    this.form.controls.spaceUse.patchValue({ subtype: '', space: '' });
    this.spaces = [];
    this.subtypes = [];

    const selectedType = this.form.controls.spaceUse.get('type')?.value;
    const selectedItem = this.spaceUse.find(d => d.type === selectedType);

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
    const selectedItem = this.spaceUse.find(d => d.type === selectedType);

    if (!selectedItem || !Array.isArray(selectedItem.spaces)) return;

    const subtypeItem = (selectedItem.spaces as any[]).find(sub => sub.type === selectedSubtype);
    if (subtypeItem) {
      this.spaces = subtypeItem.spaces;
    }
  }

  submitForm(){
    console.log("submit")
  }

  resetForm(){
    console.log("submit")
  }
}
