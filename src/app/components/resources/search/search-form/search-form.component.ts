import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchGridComponent } from '../search-grid/search-grid.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConstService } from 'src/app/shared/services/const.service';
import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { ISearchGridOutput } from 'src/app/shared/interfaces/search/search.interface';
import { NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { IFacilityConfig } from 'src/app/shared/interfaces/facility/facilityConfig';
import { IEquipmentConfig } from 'src/app/shared/interfaces/equipment/equipmentConfig';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [
    CommonModule,
    NgbNavModule,
    ReactiveFormsModule,
    SearchGridComponent,
    NgFor,
    MatIcon
  ],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent {
  active = 1;
  constService = inject(ConstService);
  constFacilityService = inject(ConstFacilityService);
  searchService = inject(SearchService);
  resourcesService = inject(ResourcesService);

  organizationLevels = this.constService.ORGANIZATION_LEVELS;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;
  organizationFunctionsMap = this.constService.ORGANIZATION_FUNCTIONS_MAP;

  loading = false;
  showMoreOrganizationFields = false;
  showMoreOrganizationUnitFields = false;

  // For Facility
  useOfFacility: string[];
  auxiliarySpace: boolean = false;
  types: string[] = [];

  // For Space
  subtypesList: string[][] = [];
  spacesList: string[][] = [];
  
  AUXILIARY_SPACES = this.constFacilityService.AUXILIARY_SPACES;
  SPACE_USE = this.constFacilityService.SPACE_USE;
  spaceUse: IFacilityConfig[];

  // For Equipment
  resourceSubcategory: string[] = [];
  kind: string[] = [];
  type: string[] = [];
  equipmentConfig: IEquipmentConfig[] = [];

  rowData: ISearchGridOutput[] | null;

  form!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.resourcesService.getFacilityCategories()
      .subscribe(result => {
        this.useOfFacility = result.map(item => item.type);
      })
    this.resourcesService.getEquipmentCategories()
      .subscribe(result => {
        this.equipmentConfig = result;
        this.resourceSubcategory = this.getResourceSubcategory()
      })
  }

  initializeForm() {
    this.form = new FormGroup({
      facilities: new FormGroup({
        organization: new FormControl(''),
        kaek: new FormControl(''),
        distinctiveNameOfFacility: new FormControl(''),
        useOfFacility: new FormArray([]),
        coveredPremisesArea: new FormGroup({
          from: new FormControl(''),
          until: new FormControl(''),
        }),
        addressOfFacility: new FormGroup({
          street: new FormControl(''),
          number: new FormControl(''),
          postcode: new FormControl(''),
          area: new FormControl(''),
          municipality: new FormControl(''),
          geographicRegion: new FormControl(''),
          country: new FormControl('ΕΛΛΑΣ'),
        }),
        floorsOrLevels: new FormGroup({
          from: new FormControl('', [Validators.pattern(/^\d+?$/)]),
          until: new FormControl('', [Validators.pattern(/^\d+?$/)]),
        }),
        uniqueUseOfFacility: new FormControl(true),
        private: new FormControl(true)
      }),
      spaces: new FormGroup({
        organization: new FormControl(''),
        spaceName: new FormControl(''),
        spaceUse: new FormArray([
          new FormGroup({
            type: new FormControl(''),
            subtype: new FormControl(''),
            space: new FormControl(''),
            auxiliarySpace: new FormControl(false)
          }),
        ]),
        spaceArea: new FormGroup({
          from: new FormControl('', [Validators.pattern(/^\d+(\.\d+)?$/)]),
          until: new FormControl('', [Validators.pattern(/^\d+(\.\d+)?$/)]),
        }),
        // auxiliarySpace: new FormControl(false)
      }),
      equipments: new FormGroup({
        organization: new FormControl(''),
        resourceSubcategory: new FormControl(''),
        kind: new FormControl(''),
        type: new FormControl(''),
        acquisitionDate: new FormGroup({
          from: new FormControl(''),
          until: new FormControl(''),
        }),
        depreciationDate: new FormGroup({
          from: new FormControl(''),
          until: new FormControl(''),
        }),
        itemDescription: new FormArray([]),
        status: new FormControl(''),
      })
    });
  }

  // Getters for FormArrays
  get useOfFacilityArray() {
    return (this.form.get('facilities.useOfFacility') as FormArray);
  }

  get spaceUseArray() {
    return (this.form.get('spaces.spaceUse') as FormArray);
  }

  get itemDescriptionArray() {
    return (this.form.get('equipments.itemDescription') as FormArray);
  }

  // Add and Remove methods
  addUseOfFacility() {
    this.useOfFacilityArray.push(new FormControl(''));
  }

  removeUseOfFacility(index: number) {
    this.useOfFacilityArray.removeAt(index);
  }

  addSpaceUse() {
    this.spaceUseArray.push(
      new FormGroup({
        type: new FormControl('',),
        subtype: new FormControl(''),
        space: new FormControl(''),
        auxiliarySpace: new FormControl(false), // Add this too
      })
    );
  }

  removeSpaceUse(index: number) {
    this.spaceUseArray.removeAt(index);
  }

  removeItemDescription(index: number) {
    this.itemDescriptionArray.removeAt(index);
  }

  // For Space
  onAuxiliarySpaceChange(status:boolean){
    return this.auxiliarySpace = status? true: false;
  }

  onTypeChange(index: number): void {
    const control = this.spaceUseArray.at(index);
    control.patchValue({ subtype: '', space: '' });

    this.spacesList[index] = [];
    this.subtypesList[index] = [];

    const selectedType = control.get('type')?.value;
    const selectedItem = this.SPACE_USE.find(d => d.type === selectedType);

    if (!selectedItem) return;

    const isDirectSpaces = selectedItem.spaces.every(s => typeof s === 'string');

    if (isDirectSpaces) {
      this.spacesList[index] = selectedItem.spaces as string[];
    } else {
      this.subtypesList[index] = (selectedItem.spaces as any[]).map(sub => sub.type);
    }
  }

  onSubtypeChange(index: number): void {
    const control = this.spaceUseArray.at(index);
    control.patchValue({ space: '' });

    this.spacesList[index] = [];

    const selectedType = control.get('type')?.value;
    const selectedSubtype = control.get('subtype')?.value;

    const selectedItem = this.SPACE_USE.find(d => d.type === selectedType);

    if (!selectedItem || !Array.isArray(selectedItem.spaces)) return;

    const subtypeItem = (selectedItem.spaces as any[]).find(sub => sub.type === selectedSubtype);
    if (subtypeItem) {
      this.spacesList[index] = subtypeItem.spaces;
    }
  }

  // For Equipment
  getResourceSubcategory() {
    return this.equipmentConfig.map(data => data.resourceSubcategory); 
  }

  onResourcesubcategoryChange(event: Event) {
    const resourcesubcategory = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.kind = this.getKinds(resourcesubcategory);
    this.form.patchValue({ 'equipments.kind': '', 'equipments.type': '' });
    this.type = [];

    const itemDescriptionArray = this.form.get('equipments.itemDescription') as FormArray;
    itemDescriptionArray.clear(); // Remove existing items
  }
  
  onKindChange(event: Event) {
    const kind = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    this.type = this.getTypes(this.form.value.equipments.resourceSubcategory, kind);
    this.form.patchValue({ 'equipments.type': '' });

    const itemDescriptionArray = this.form.get('equipments.itemDescription') as FormArray;
    itemDescriptionArray.clear(); // Remove existing items
  }

  onTypeEquipmentChange(event: Event) {
    const type = (event.target as HTMLSelectElement).value.split(':')[1].trim();
    const descriptions = this.getItemDescriptions(this.form.value.equipments.resourceSubcategory, this.form.value.equipments.kind, type);

    const itemDescriptionArray = this.form.get('equipments.itemDescription') as FormArray;
    itemDescriptionArray.clear(); // Remove existing items

    descriptions.forEach(desc => {
      const [descriptionText] = desc.split('=');
      itemDescriptionArray.push(
        new FormGroup({
          description: new FormControl(descriptionText),
          value: new FormControl(''),
        })
      );
    });
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

  resetForm() {
    this.form.reset();
    this.initializeForm(); // reinitialize default structure
  }

  submitForm() {
    if (this.form.valid) {
      console.log('Form Data:', this.form.getRawValue()); // getRawValue includes disabled fields
    } else {
      console.log('Form is invalid');
    }
  }
 
  // transformData(input: any): any {
  //   const transformed = {};

  //   // Transform each section if it has non-empty values
  //   const organizations = this.transformSection(input.organizations, "organizations");
  //   if (organizations) transformed['organizations'] = organizations;

  //   const organizationalUnits = this.transformSection(input.organizational_units, "organizational_units");
  //   if (organizationalUnits) transformed['organizational_units'] = organizationalUnits;

  //   const remits = this.transformSection(input.remits, "remits");
  //   if (remits) transformed['remits'] = remits;

  //   const cleanData = this.cleanData(transformed)

  //   return cleanData;
  // }

  // transformSection(section: any, sectionName: string) {
  //   const mustArray = [];
  //   for (const key in section) {
  //     if (section.hasOwnProperty(key)) {
  //       const value = section[key];

  //       // Check if value is an object with date and range fields (i.e., date field)
  //       // if (typeof value === 'object' && value.date && value.range) {
  //       //     mustArray.push({
  //       //         field: key,
  //       //         // type: "date",
  //       //         query: { [value.range]: new Date(value.date).toISOString() }
  //       //     });
  //       // }
  //       // Check if value is an object with date and from fields (i.e., date field)
  //       if (typeof value === 'object' && value.from) {
  //         mustArray.push({
  //           field: key,
  //           // type: "date",
  //           query: { "gte": new Date(value.from).toISOString() }
  //         });
  //       }
  //       // Check if value is an object with date and until fields (i.e., date field)
  //       if (typeof value === 'object' && value.until) {
  //         mustArray.push({
  //           field: key,
  //           // type: "date",
  //           query: { "lte": new Date(value.until).toISOString() }
  //         });
  //       }
  //       // If it's a nested object with specific fields, like foundationFek or mainAddress
  //       else if (typeof value === 'object' && !Array.isArray(value)) {
  //         for (const nestedKey in value) {
  //           if (value[nestedKey]) {  // Check if the nested field has a value
  //             mustArray.push({
  //               field: `${key}.${nestedKey}`,
  //               type: "words",
  //               query: value[nestedKey]
  //             });
  //           }
  //         }
  //       }
  //       // If it's an array (for remitFoundation in remits), iterate over each element
  //       else if (Array.isArray(value)) {
  //         value.forEach((item) => {
  //           // if (item.date && item.range) {
  //           //     mustArray.push({
  //           //         field: `${key}`,
  //           //         // type: "date",
  //           //         query: { [item.range]: new Date(item.date).toISOString() }
  //           //     });
  //           // }
  //           if (item.from || item.until) {

  //             if ("from" in item) {
  //               mustArray.push({
  //                 field: `${key}`,
  //                 // type: "date",
  //                 query: { "gte": new Date(item.from).toISOString() }
  //               });
  //             }

  //             if ("until" in item) {
  //               mustArray.push({
  //                 field: `${key}`,
  //                 // type: "date",
  //                 query: { "lte": new Date(item.until).toISOString() }
  //               });
  //             }
  //           }
  //         });
  //       }
  //       // Handle regular fields with non-empty values
  //       else if (value) {
  //         if ((key === "statusActive" || key === "statusInactive") && sectionName === "organizations") {
  //           mustArray.push({
  //             field: "status",
  //             type: 'words',
  //             query: key === "statusActive" ? "Active" : "Inactive"
  //           });
  //         } else if (((key === "statusActive" || key === "statusInactive") && sectionName === "remits")) {
  //           mustArray.push({
  //             field: "status",
  //             type: 'words',
  //             query: key === "statusActive" ? "ΕΝΕΡΓΗ" : "ΑΝΕΝΕΡΓΗ"
  //           });
  //         } else {

  //           // mustArray.push({
  //           //   field: key,
  //           //   type: key === "preferredLabel" || key === "remitText" ? section[`${key}Search`] : 'words',
  //           //   query: key === "cofog1" || key === "cofog2" || key === "cofog3" ? this.getCofogName(key) : value
  //           // });
  //         }
  //       }
  //     }
  //   }

  //   return mustArray.length ? { must: mustArray } : null;
  // }

  // cleanData(obj: any) {
  //   // Check and remove preferredLabelSearch and remitTextSearch
  //   obj['organizations']['must'] = obj['organizations']['must'].filter(item => item.field !== "preferredLabelSearch");
  //   obj['organizational_units']['must'] = obj['organizational_units']['must'].filter(item => item.field !== "preferredLabelSearch");
  //   obj['remits']['must'] = obj['remits']['must'].filter(item => item.field !== "remitTextSearch");

  //   // Check and remove organizational_units if must array is empty
  //   if (obj.organizational_units?.must.length === 0) {
  //     delete obj.organizational_units;
  //   }

  //   const specificDocument = {
  //     field: "status",
  //     type: "words",
  //     query: "ΕΝΕΡΓΗ"
  //   };

  //   // Check and remove remits if must array only contains the specific document
  //   if (obj.remits?.must.length === 1 && JSON.stringify(obj.remits.must[0]) === JSON.stringify(specificDocument)) {
  //     delete obj.remits;
  //   }

  //   return obj
  // }

  // moreFields(part: string) {
  //   if (part === 'organization')
  //     this.showMoreOrganizationFields = true;
  //   else
  //     this.showMoreOrganizationUnitFields = true

  // }

  // lessFields(part: string) {
  //   if (part === 'organization')
  //     this.showMoreOrganizationFields = false;
  //   else
  //     this.showMoreOrganizationUnitFields = false

  // }

  
}
