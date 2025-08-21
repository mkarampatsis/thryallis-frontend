import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchGridComponent } from '../search-grid/search-grid.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConstService } from 'src/app/shared/services/const.service';
import { ConstFacilityService } from 'src/app/shared/services/const-facility.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { ISearchGridOutput } from 'src/app/shared/interfaces/search/search.interface';
import { NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [
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
  searchService = inject(SearchService);

  organizationLevels = this.constService.ORGANIZATION_LEVELS;
  organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;
  organizationFunctionsMap = this.constService.ORGANIZATION_FUNCTIONS_MAP;

  loading = false;
  showMoreOrganizationFields = false;
  showMoreOrganizationUnitFields = false;

  rowData: ISearchGridOutput[] | null;

  form!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.form = new FormGroup({
      facilities: new FormGroup({
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
        spaceName: new FormControl(''),
        spaceUse: new FormArray([
          new FormGroup({
            type: new FormControl({ value: '', disabled: true }),
            subtype: new FormControl(''),
            space: new FormControl(''),
          }),
        ]),
        spaceArea: new FormGroup({
          from: new FormControl('', [Validators.pattern(/^\d+(\.\d+)?$/)]),
          until: new FormControl('', [Validators.pattern(/^\d+(\.\d+)?$/)]),
        }),
        auxiliarySpace: new FormControl(false)
      }),
      equipments: new FormGroup({
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
        itemDescription: new FormArray([
          new FormGroup({
            value: new FormControl(''),
            description: new FormControl(''),
            info: new FormControl('')
          })
        ]),
        status: new FormControl(''),
        organization: new FormControl(''),
        organizationCode: new FormControl(''),
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
        type: new FormControl({ value: '', disabled: true }),
        subtype: new FormControl(''),
        space: new FormControl(''),
      })
    );
  }

  removeSpaceUse(index: number) {
    this.spaceUseArray.removeAt(index);
  }

  addItemDescription() {
    this.itemDescriptionArray.push(
      new FormGroup({
        value: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        info: new FormControl('', Validators.required)
      })
    );
  }

  removeItemDescription(index: number) {
    this.itemDescriptionArray.removeAt(index);
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
