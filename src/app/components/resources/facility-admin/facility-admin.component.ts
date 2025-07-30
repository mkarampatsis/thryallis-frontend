import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFacilityConfig } from 'src/app/shared/interfaces/facility/facilityConfig';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-facility-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxJsonViewerModule],
  templateUrl: './facility-admin.component.html',
  styleUrl: './facility-admin.component.css'
})
export class FacilityAdminComponent implements OnInit {
  resourcesService = inject(ResourcesService);

  useOfFacility: IFacilityConfig[];

  // form: FormGroup;

  // constructor(private fb: FormBuilder) {
  //   this.form = this.fb.group({
  //     types: this.fb.array([]),
  //   });
  // }

  form = new FormGroup({
    types: new FormArray([])
  })

  ngOnInit(): void {
    this.resourcesService.getFacilityCategories()
    .subscribe(result => {
      this.useOfFacility = result;
      this.loadInitialData();
    })
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
    // return this.fb.control(value, Validators.required);
    return new FormControl(value, Validators.required)
  }

  newSpaceGroup(type = '-', spaces: string[] = []): FormGroup {
    // return this.fb.group({
    //   type: [type, Validators.required],
    //   spaces: this.fb.array(spaces.map(s => this.newSpaceString(s))),
    // });
    return new FormGroup({
      type: new FormControl(type, Validators.required),
      spaces: new FormArray(spaces.map(s => this.newSpaceString(s)))   
    })
  }

  newFacilityType(type = '', spaces: any[] = [], id: string | null = null): FormGroup {
    // return this.fb.group({
    //   _id: [id], // Track if it's an existing doc
    //   type: [type, Validators.required],
    //   spaces: this.fb.array(spaces.map(sg => this.newSpaceGroup(sg.type, sg.spaces))),
    // });
    return new FormGroup({
      _id: new FormControl(id),
      type: new FormControl(type, Validators.required),
      spaces: new FormArray(spaces.map(sg => this.newSpaceGroup(sg.type, sg.spaces)))   
    })
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

  // loadInitialData(): void {
  //   this.facilityData.forEach(ft =>
  //     this.types.push(this.newFacilityType(ft.type, ft.spaces))
  //   );
  // }

  loadInitialData(): void {
    this.useOfFacility.forEach(ft => {
        console.log(">>>",ft);
        this.types.push(this.newFacilityType(ft.type, ft.spaces, ft._id["$oid"] ?? null));
      }
    );
  }

  submit(): void {
    const result = this.form.value;

    const newRecords = result.types.filter((t: any) => !t._id);
    const updates = result.types.filter((t: any) => t._id);

    console.log('New Records:', newRecords);
    console.log('Updates:', updates);
  }

  // Remove _id from json useOfFaclility for NgxJsonViewerModule
  get cleanedTypes(): any {
    return this.removeIdsFromTypes(this.useOfFacility);
  }

  private removeIdsFromTypes(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.removeIdsFromTypes(item));
    } else if (typeof data === 'object' && data !== null) {
      const result: any = {};
      for (const key in data) {
        if (key === '_id') continue;
        result[key] = this.removeIdsFromTypes(data[key]);
      }
      return result;
    } else {
      return data;
    }
  }

}
