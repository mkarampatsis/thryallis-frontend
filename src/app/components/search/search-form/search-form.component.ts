import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchGridComponent } from '../search-grid/search-grid.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConstService } from 'src/app/shared/services/const.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { ISearchGrid } from 'src/app/shared/interfaces/search/search.interface';
import { ICofog2 } from 'src/app/shared/interfaces/cofog/cofog2.interface';
import { ICofog3 } from 'src/app/shared/interfaces/cofog/cofog3.interface';
import { Subscription, take } from 'rxjs';
import { NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { query } from '@angular/animations';


@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [NgbNavModule, ReactiveFormsModule, SearchGridComponent, NgFor,MatIcon],
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

    organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;
    organizationUnitFunctionsMap = this.constService.ORGANIZATION_FUNCTIONS_MAP;
    
    remitType = this.constService.REMIT_TYPES;
    cofog1 = this.constService.COFOG;
    cofog2: ICofog2[] = [];
    cofog3: ICofog3[] = [];
    cofog1_selected: boolean = false;
    cofog2_selected: boolean = false;

    loading = false; 
    showMoreOrganizationFields = false;
    showMoreOrganizationUnitFields = false;

    rowData: ISearchGrid[] | null;

    form = new FormGroup({
        organizations: new FormGroup({
            preferredLabel: new FormControl('', Validators.required),
            preferredLabelSearch: new FormControl(''),
            typesMap: new FormControl('', Validators.required),
            functionsMap: new FormControl('', Validators.required),
            subOrganizationOf: new FormControl('', Validators.required),
            levels: new FormControl('', Validators.required),
            statusActive: new FormControl(true, Validators.required),
            statusInactive: new FormControl(false, Validators.required),
            foundationDate: new FormGroup({
                date: new FormControl('', Validators.required),
                range: new FormControl('', Validators.required),
            }),
            terminationDate: new FormGroup({
                date: new FormControl('', Validators.required),
                range: new FormControl('', Validators.required),
            }),
            foundationFek: new FormGroup({
                date: new FormControl('', Validators.required),
                range: new FormControl('', Validators.required),
            }),
            mainAddress: new FormGroup({
                postCode: new FormControl('', Validators.required)
            }) 
        }),
        organizational_units: new FormGroup({
            preferredLabel: new FormControl('', Validators.required),
            preferredLabelSearch: new FormControl(''),
            typesMap: new FormControl('', Validators.required),
            functionsMap: new FormControl('', Validators.required),
            numOfSubunits: new FormControl('', Validators.required),
            mainAddress: new FormGroup({
                postCode: new FormControl('', Validators.required)
            })
        }),
        remits: new FormGroup({
            remitText: new FormControl('', Validators.required),
            remitTextSearch: new FormControl(''),
            remitType: new FormControl('', Validators.required),
            cofog1: new FormControl('', Validators.required),
            cofog2: new FormControl('', Validators.required),
            cofog3: new FormControl('', Validators.required),
            statusActive: new FormControl(true, Validators.required),
            statusInactive: new FormControl(false, Validators.required),
            remitFoundation: new FormArray([
                new FormGroup({
                    date: new FormControl('', Validators.required),
                    range: new FormControl('', Validators.required), 
                })
            ])
        })
    });

    formSubscriptions: Subscription[] = [];
    
    remitFoundations = this.form.get('remits.remitFoundation') as FormArray 

    ngOnInit() {
        this.initializeForm();

        this.formSubscriptions.push(
            this.form.get('remits.cofog1').valueChanges.subscribe((value) => {
                if (value) {
                    this.form.get('remits.cofog2').setValue('');
                    this.cofog1_selected = true;
                    this.cofog2_selected = false;
                    this.cofog2 = this.constService.COFOG.find((cofog) => cofog.code === value)?.cofog2 || [];
                }
            }),
        );

        this.formSubscriptions.push(
            this.form.get('remits.cofog2').valueChanges.subscribe((value) => {
                if (value) {
                    this.form.get('remits.cofog3').setValue('');
                    this.cofog2_selected = true;
                    this.cofog3 = this.cofog2.find((cofog) => cofog.code === value)?.cofog3 || [];
                }
            }),
        );
    }

    ngOnDestroy(): void {
        this.formSubscriptions.forEach((sub) => sub.unsubscribe());
    }

    onSubmit() {
        this.loading = true;

        console.log(this.form.value);
        const searchQuery = this.transformData(this.form.value);
        console.log(searchQuery);
        
        this.searchService
            .postSearch(searchQuery)
            .pipe(take(1))
            .subscribe((data) => {
                // console.log(data)
                const newData = data.organizations.map(org => {
                    return org.organizational_units.map(unit => {
                      return {
                        organizationCode: org.code,
                        organizationScore: org.score,
                        organizationObjectId: org.object_id,
                        organizationPreferredLabel: org.preferredLabel,
                        organizationalUnitCode: unit.code,
                        organizationalUnitScore: unit.code,
                        organizationalUnitObjectId: unit.object_id,
                        organizationalUnitPreferredLabel: unit.preferredLabel,
                        remitRemitText: unit['remit'] ? unit.remit.remitText: "Δεν υπάρχουν στοιχεία",
                        remitObjectId: unit['remit']? unit.remit.object_id :"" 
                      };
                    });
                  }).flat();
                this.rowData = newData;
                this.loading = false;
            });
    }

    resetForm(){
        this.initializeForm();
        this.rowData = null
        this.cofog1_selected = false;
        this.cofog2_selected = false;
        this.showMoreOrganizationFields = false;
        this.showMoreOrganizationUnitFields = false
        this.loading = false
    }

    initializeForm(){
        this.form.controls.organizations.patchValue({
            preferredLabel:"",
            preferredLabelSearch:"phrase",
            subOrganizationOf:"",
            statusActive: true,
            statusInactive: false,
            typesMap: "",
            functionsMap: "",
            levels:"",
            foundationDate: {
                date: "",
                range: ""
            },
            terminationDate: {
                date: "",
                range: ""
            },
            mainAddress:{
                postCode:""
            },
            foundationFek:{
                date:"",
                range:""
            }

        });

        this.form.controls.organizational_units.patchValue({
            preferredLabel: "",
            preferredLabelSearch:"phrase",
            typesMap: "",
            functionsMap: "",
            numOfSubunits: "",
            mainAddress:{
                postCode:""
            },
        });
  
        this.form.controls.remits.patchValue({
                remitText: '',
                remitTextSearch: 'phrase',
                remitType: '',
                cofog1: '',
                cofog2: '',
                cofog3: '',
                statusActive: true,
                statusInactive: false,
        });

        console.log(this.form.controls.remits.value)

        const remitFoundationArray = this.form.get('remits.remitFoundation') as FormArray;
        remitFoundationArray.clear(); // Clears all existing controls

        // Add a single empty group (like the one in the initial form definition)
        remitFoundationArray.push(
            new FormGroup({
                date: new FormControl('', Validators.required),
                range: new FormControl('', Validators.required),
            })
        );
    }

    getCofogName(data:string){
        
        if (data ==='cofog1'){
            const cofog_1_value = this.form.controls.remits.controls.cofog1.value
            return this.constService.COFOG.find((cofog) => cofog.code === cofog_1_value).name
        }

        if (data ==='cofog2'){
            const cofog_1_value = this.form.controls.remits.controls.cofog1.value
            const cofog_2_value = this.form.controls.remits.controls.cofog2.value
            return  this.constService.COFOG
                        .find((cofog) => cofog.code === cofog_1_value)
                        .cofog2.find((cofog) => cofog.code === cofog_2_value).name
        }

        if (data ==='cofog3'){
            const cofog_1_value = this.form.controls.remits.controls.cofog1.value
            const cofog_2_value = this.form.controls.remits.controls.cofog2.value
            const cofog_3_value = this.form.controls.remits.controls.cofog3.value
            return  this.constService.COFOG
                        .find((cofog) => cofog.code === cofog_1_value)
                        .cofog2.find((cofog) => cofog.code === cofog_2_value)
                        .cofog3.find((cofog) => cofog.code === cofog_3_value).name
        }
    }

    transformData(input: any): any {
        const transformed = {};
      
        // Transform each section if it has non-empty values
        const organizations = this.transformSection(input.organizations, "organizations");
        if (organizations) transformed['organizations'] = organizations;
      
        const organizationalUnits = this.transformSection(input.organizational_units, "organizational_units");
        if (organizationalUnits) transformed['organizational_units'] = organizationalUnits;
      
        const remits = this.transformSection(input.remits, "remits");
        if (remits) transformed['remits'] = remits;

        transformed['organizations']['must'] = transformed['organizations']['must'].filter(item => item.field !== "preferredLabelSearch");
        transformed['organizational_units']['must'] = transformed['organizational_units']['must'].filter(item => item.field !== "preferredLabelSearch");
        transformed['remits']['must'] = transformed['remits']['must'].filter(item => item.field !== "preferredLabelSearch");
        
        return transformed;
    }

    transformSection(section: any, sectionName: string) {
        const mustArray = [];
        for (const key in section) {
            if (section.hasOwnProperty(key)) {
                const value = section[key];
                
                // Check if value is an object with date and range fields (i.e., date field)
                if (typeof value === 'object' && value.date && value.range) {
                mustArray.push({
                    field: key,
                    // type: "date",
                    query: { [value.range]: new Date(value.date).toISOString() }
                });
                }
                // If it's a nested object with specific fields, like foundationFek or mainAddress
                else if (typeof value === 'object' && !Array.isArray(value)) {
                for (const nestedKey in value) {
                    if (value[nestedKey]) {  // Check if the nested field has a value
                    mustArray.push({
                        field: `${key}.${nestedKey}`,
                        type: "words",
                        query: value[nestedKey]
                    });
                    }
                }
                }
                // If it's an array (for remitFoundation in remits), iterate over each element
                else if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item.date && item.range) {
                    mustArray.push({
                        field: `${key}`,
                        // type: "date",
                        query: { [item.range]: new Date(item.date).toISOString() }
                    });
                    }
                });
                }
                // Handle regular fields with non-empty values
                else if (value) {
                    if ((key==="statusActive" || key==="statusInactive") &&  sectionName==="organizations"){
                        console.log(">>>",key, sectionName)
                        mustArray.push({
                            field: "status",
                            type: 'words',
                            query: key==="statusActive"?"Active":"Inactive"
                        });
                    } else if (((key==="statusActive" || key==="statusInactive") &&  sectionName==="remits")){
                        mustArray.push({
                            field: "status",
                            type: 'words',
                            query: key==="statusActive"?"ΕΝΕΡΓΗ":"ΑΝΕΝΕΡΓΗ"
                        });
                    } else {

                        mustArray.push({
                            field: key,
                            type: key==="preferredLabel" || key==="remitText"?section[`${key}Search`]:'words',
                            query: key ==="cofog1"  || key ==="cofog2"  || key ==="cofog3" ? this.getCofogName(key) : value
                        });
                    }
                }
            }
        }
    
        return mustArray.length ? { must: mustArray } : null;
      }
    
    moreFields(part: string){
        if (part === 'organization')
            this.showMoreOrganizationFields = true;
        else    
            this.showMoreOrganizationUnitFields = true

    }

    lessFields(part: string){
        if (part === 'organization')
            this.showMoreOrganizationFields = false;
        else    
            this.showMoreOrganizationUnitFields = false

    }

    removeAddress(index:number){
        if (this.remitFoundations.length>0) {
            this.remitFoundations.removeAt(index);
        }
    }

    addAddress(){
        this.remitFoundations.push(
            new FormGroup({
                date: new FormControl('', Validators.required),
                range: new FormControl('', Validators.required),
            })
        )
    }

    formValid(): boolean {
        // const legalActType = this.form.get('legalActType').value;
        // if (legalActType && ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalActType)) {
        //     if (this.emptyFEK()) {
        //         return this.form.valid;
        //     } else {
        //         console.log('>>>>>>>>>>>>', this.form.valid, this.fekYear, this.form.get('legalActDateOrYear').value);
        //         return this.form.valid && this.fekYear === this.form.get('legalActDateOrYear').value;
        //     }
        // } else {
            // return this.form.valid;
        // }
        return true
    }
}
