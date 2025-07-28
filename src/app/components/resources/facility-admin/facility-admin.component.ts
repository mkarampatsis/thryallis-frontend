import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFacilityConfig } from 'src/app/shared/interfaces/facility/facilityConfig';

@Component({
  selector: 'app-facility-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facility-admin.component.html',
  styleUrl: './facility-admin.component.css'
})
export class FacilityAdminComponent implements OnInit {
  @Input() facilityData: IFacilityConfig[] = [];
  
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      types: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  get types(): FormArray {
    return this.form.get('types') as FormArray;
  }

  spaces(i: number): FormArray {
    return this.types.at(i).get('spaces') as FormArray;
  }

  spaceStrings(i: number, j: number): FormArray {
    return this.spaces(i).at(j).get('spaces') as FormArray;
  }

  newSpaceString(value = ''): FormControl {
    return this.fb.control(value, Validators.required);
  }

  newSpaceGroup(type = '-', spaces: string[] = []): FormGroup {
    return this.fb.group({
      type: [type, Validators.required],
      spaces: this.fb.array(spaces.map(s => this.newSpaceString(s))),
    });
  }

  // newFacilityType(type = '', spaces: any[] = []): FormGroup {
  //   return this.fb.group({
  //     type: [type, Validators.required],
  //     spaces: this.fb.array(spaces.map(sg => this.newSpaceGroup(sg.type, sg.spaces))),
  //   });
  // }

  newFacilityType(type = '', spaces: any[] = [], id: string | null = null): FormGroup {
  return this.fb.group({
    _id: [id], // Track if it's an existing doc
    type: [type, Validators.required],
    spaces: this.fb.array(spaces.map(sg => this.newSpaceGroup(sg.type, sg.spaces))),
  });
}

  addFacilityType(): void {
    this.types.push(this.newFacilityType());
  }

  addSpaceGroup(typeIndex: number): void {
    this.spaces(typeIndex).push(this.newSpaceGroup());
  }

  addSpaceString(typeIndex: number, spaceGroupIndex: number): void {
    this.spaceStrings(typeIndex, spaceGroupIndex).push(this.newSpaceString());
  }

  loadInitialData(): void {
    this.facilityData.forEach(ft =>
      this.types.push(this.newFacilityType(ft.type, ft.spaces))
    );
  }

  submit(): void {
    console.log(this.form.value);
    // send this.form.value to Flask API
  }
}
