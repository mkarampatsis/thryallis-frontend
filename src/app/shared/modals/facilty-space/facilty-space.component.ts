import { Component, inject } from '@angular/core';

import { ConstFacilityService } from '../../services/const-facility.service';

import { IFacility } from '../../interfaces/facility/facility';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-facilty-space',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './facilty-space.component.html',
  styleUrl: './facilty-space.component.css'
})
export class FaciltySpaceComponent {
  constFacilityService = inject(ConstFacilityService)
  modalRef: any;
  facilty: IFacility;

  // cofog1 = this.constService.COFOG;
  // cofog2: ICofog2[] = [];
  // cofog3: ICofog3[] = [];
  // cofog1_selected: boolean = false;
  // cofog2_selected: boolean = false;

  form = new FormGroup({
    facilityID: new FormControl('', Validators.required),
    spaceName: new FormControl('', Validators.required),
    spaceUse: new FormControl('', Validators.required),
    spaceUseTree: new FormControl('', Validators.required),
    spaceArea: new FormControl('', Validators.required),
    spaceLength: new FormControl('', Validators.required),
    spaceWidth: new FormControl('', Validators.required),
    entrances: new FormControl('', Validators.required),
    windows: new FormControl('', Validators.required),
    floor_level: new FormControl('', Validators.required)
  })

  submitForm(){
    console.log("submit")
  }

  resetForm(){
    console.log("submit")
  }
}
