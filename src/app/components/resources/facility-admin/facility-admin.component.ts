import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  newSpaceString(spaceValue = '', isReadonly = false): FormGroup {
    return new FormGroup({
      value: new FormControl(spaceValue, Validators.required),
      readonly: new FormControl(isReadonly),
    });
}

  newSpaceGroup(type = '-', spaces: string[] = [], isReadonly = false): FormGroup {
    return new FormGroup({
      type: new FormControl(type, Validators.required),
      spaces: new FormArray(
        spaces.map(s => this.newSpaceString(s, isReadonly))
      ),
      readonly: new FormControl(isReadonly),
    });
  }

  newFacilityType(type = '', spaces: any[] = [], id: string | null = null, isReadonly = false): FormGroup {
    return new FormGroup({
      _id: new FormControl(id),
      type: new FormControl(type, Validators.required),
      spaces: new FormArray(spaces.map(sg => this.newSpaceGroup(sg.type, sg.spaces, isReadonly))),
      readonly: new FormControl(isReadonly),   
    })
  }

  addFacilityType(): void {
    this.types.push(this.newFacilityType());
  }

  addSpaceGroup(typeIndex: number): void {
    this.spaces(typeIndex).push(this.newSpaceGroup());
  }
  
  // addSpaceString(typeIndex: number, spaceGroupIndex: number): void {
  //   this.spaceStrings(typeIndex, spaceGroupIndex).push(this.newSpaceString());
  // }

  addSpaceString(typeIndex: number, spaceGroupIndex: number): void {
    this.spaceStrings(typeIndex, spaceGroupIndex).push(this.newSpaceString('', false));
  }

  loadInitialData(): void {
    this.useOfFacility.forEach(ft => {
        this.types.push(this.newFacilityType(ft.type, ft.spaces, ft._id["$oid"] ?? null, true));
      }
    );
  }

  submit(): void {
    const result = this.form.value;

    const newRecords = result.types.filter((t: any) => !t._id);
    const updatedRecords = result.types.filter((t: any) => t._id);

    if (newRecords){
      console.log('New Records:', newRecords);
      this.resourcesService.createFacilitiesCategories(newRecords)
        .subscribe(response => {
          const body = response.body;
          const status = response.status;
          if (status === 201) {
            console.log("New",body)
            // this.getFacilitiesByOrganizationCode()
            // this.getSpacesFacilityId(facilityId)
          }
        })
    }

    if (updatedRecords) {
      console.log('Updates:', updatedRecords);
      this.resourcesService.updateFacilitiesCategories(updatedRecords)
        .subscribe(response => {
          const body = response.body;
          const status = response.status;
          if (status === 201) {
            console.log("Uodates",body)
            // this.getFacilitiesByOrganizationCode()
            // this.getSpacesFacilityId(facilityId)
          }
        })
    }
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

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  asFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

}
