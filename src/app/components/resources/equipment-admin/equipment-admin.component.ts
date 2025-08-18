import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IEquipmentConfig } from 'src/app/shared/interfaces/equipment/equipmentConfig';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-equipment-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxJsonViewerModule],
  templateUrl: './equipment-admin.component.html',
  styleUrl: './equipment-admin.component.css'
})
export class EquipmentAdminComponent {
  resourcesService = inject(ResourcesService);
  modalService = inject(ModalService);

  useOfEquipment: IEquipmentConfig[];

  form = new FormGroup({
    types: new FormArray([])
  })

  ngOnInit(): void {
    this.getCategories()
  }

  getCategories(){
    this.resourcesService.getEquipmentCategories()
    .subscribe(result => {
      this.useOfEquipment = result;
      this.loadInitialData();
    })
  }

  // Remove _id from json useOfFaclility for NgxJsonViewerModule
  get cleanedTypes(): any {
    return this.removeIdsFromTypes(this.useOfEquipment);
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

  get types(): FormArray {
    return this.form.get('types') as FormArray;
  }

  kind(i: number): FormArray {
    return this.types.at(i).get('kind') as FormArray;
  }

  itemDescriptionStrings(i: number, j: number): FormArray {
    return this.kind(i).at(j).get('type') as FormArray;
  }

  newItemDescription(value = '', isReadonly = false): FormGroup {
    return new FormGroup({
      value: new FormControl(value, Validators.required),
      readonly: new FormControl(isReadonly),
    });
  }

  newTypeGroup(name = '', itemDescription: string[] = [], isReadonly = false): FormGroup {
    return new FormGroup({
      name: new FormControl(name, Validators.required),
      itemDescription: new FormArray(itemDescription.map(desc => this.newItemDescription(desc, isReadonly))),
      readonly: new FormControl(isReadonly),
    });
  }

  newKindGroup(name = '', types: any[] = [], isReadonly = false): FormGroup {
    return new FormGroup({
      name: new FormControl(name, Validators.required),
      type: new FormArray(types.map(t => this.newTypeGroup(t.name, t.itemDescription, isReadonly))),
      readonly: new FormControl(isReadonly),
    });
  }

  newEquipment(resourceSubcategory = '', kind: any[] = [], id: string | null = null, isReadonly = false): FormGroup {
    return new FormGroup({
      _id: new FormControl(id),
      resourceSubcategory: new FormControl(resourceSubcategory, Validators.required),
      kind: new FormArray(kind.map(k => this.newKindGroup(k.name, k.type, isReadonly))),
      readonly: new FormControl(isReadonly),
    });
  }

  addEquipmentType(): void {
    this.types.push(this.newEquipment());
  }

  addKindGroup(kindIndex: number): void {
    this.kind(kindIndex).push(this.newKindGroup());
  }

  addTypeGroup(equipIndex: number, kindIndex: number): void {
    const typeArray = this.asFormArray(this.kind(equipIndex).at(kindIndex).get('type'));
    typeArray.push(this.newTypeGroup()); // empty type group
  }

  addItemDescription(equipIndex: number, kindIndex: number, typeIndex: number): void {
    const typeArray = this.asFormArray(this.kind(equipIndex).at(kindIndex).get('type'));
    const itemDescArray = this.asFormArray(typeArray.at(typeIndex).get('itemDescription'));
    itemDescArray.push(this.newItemDescription('', false));
  }

  loadInitialData(): void {
    this.useOfEquipment.forEach(ft => {
      this.types.push(this.newEquipment(ft.resourceSubcategory, ft.kind, ft._id?.["$oid"] ?? null, true));
    });
  }

  submit(): void {
    const result = this.form.value;

    const newRecords = result.types.filter((t: any) => !t._id);
    const updatedRecords = result.types.filter((t: any) => t._id);

    if (newRecords.length){
      const cleanedNewRecords = this.transformData(newRecords);
      console.log('New Records:', cleanedNewRecords);
      this.modalService.getUserConsent(
        "Πρόκειται να εισάγεται κάποιο είδος στην βιβλιοθήκη. Επιβεβαιώστε ότι θέλετε να συνεχίσετε."
      )
      .subscribe((result) => {
        if (result) {
         this.resourcesService.createEquipmentCategories(cleanedNewRecords)
          .subscribe(response => {
            const body = response.body;
            const status = response.status;
            if (status === 201) {
              console.log("New",body)
              this.getCategories()
            }
          })
        }
      })
    }

    if (updatedRecords.length) {
      const cleanedUpdatedRecords = this.transformData(updatedRecords);
      console.log('Updates:', cleanedUpdatedRecords);
      this.modalService.getUserConsent(
        "Πρόκειται να τροποποιήσετε κάποιο είδος στην βιβλιοθήκη. Επιβεβαιώστε ότι θέλετε να συνεχίσετε."
      )
      .subscribe((result) => {
        if (result) {
          this.resourcesService.updateEquipmentCategories(cleanedUpdatedRecords)
            .subscribe(response => {
              const body = response.body;
              const status = response.status;
              if (status === 201) {
                console.log("Uodates",body)
                this.getCategories()
              }
            })
        }
      })
    }
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  asFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  asFormArray(control: AbstractControl | null): FormArray {
    return control as FormArray;
  }

  transformData(data: any[]): any[] {
    return data
      .map(equip => ({
        ...(equip._id ? { _id: equip._id } : {}),
        resourceSubcategory: equip.resourceSubcategory,
        kind: equip.kind
          .map((k: any) => ({
            name: k.name,
            type: k.type
              .map((t: any) => ({
                name: t.name,
                itemDescription: t.itemDescription
                  .map((desc: any) => desc.value)
                  .filter((val: string) => val && val.trim() !== '') // remove empty descriptions
              }))
              .filter((t: any) => t.name && t.name.trim() !== '' && t.itemDescription.length > 0)
          }))
          .filter((k: any) => k.name && k.name.trim() !== '' && k.type.length > 0)
      }))
      .filter(equip => equip.resourceSubcategory && equip.resourceSubcategory.trim() !== '' && equip.kind.length > 0);
  }
}
