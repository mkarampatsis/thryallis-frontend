import { Component } from '@angular/core';
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

  modalRef: any;
  facilty: IFacility;

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
