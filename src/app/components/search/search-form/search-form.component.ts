import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchGridComponent } from '../search-grid/search-grid.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConstService } from 'src/app/shared/services/const.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { ISearchGrid } from 'src/app/shared/interfaces/search/search.interface';
import { ICofog2 } from 'src/app/shared/interfaces/cofog/cofog2.interface';
import { ICofog3 } from 'src/app/shared/interfaces/cofog/cofog3.interface';
import { Subscription, take } from 'rxjs';


@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [NgbNavModule, ReactiveFormsModule, SearchGridComponent],
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
            typesMap: new FormControl('', Validators.required),
            functionsMap: new FormControl('', Validators.required),
            subOrganizationOf: new FormControl('', Validators.required),
            levels: new FormControl('', Validators.required),
            status: new FormControl('', Validators.required),
            foundationDate: new FormControl('', Validators.required),
            terminationDate: new FormControl('', Validators.required),
            foundationFek: new FormGroup({
                year:new FormControl('', Validators.required)
            }),
            mainAddress: new FormGroup({
                postCode: new FormControl('', Validators.required)
            }) 
        }),
        organization_units: new FormGroup({
            preferredLabel: new FormControl('', Validators.required),
            typesMap: new FormControl('', Validators.required),
            functionsMap: new FormControl('', Validators.required),
            numOfSubunits: new FormControl('', Validators.required),
            mainAddress: new FormGroup({
                postCode: new FormControl('', Validators.required)
            })
        }),
        remits: new FormGroup({
            text: new FormControl('', Validators.required),
            type: new FormControl('', Validators.required),
            cofog1: new FormControl('', Validators.required),
            cofog2: new FormControl('', Validators.required),
            cofog3: new FormControl('', Validators.required),
            status: new FormControl('', Validators.required)
        })
    });

    formSubscriptions: Subscription[] = [];

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
 
        const searchQuery = this.buildSearchQuery(this.form);
        // console.log(searchQuery);
        
        this.searchService
            .postSearch(searchQuery)
            .pipe(take(1))
            .subscribe((data) => {
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
        this.form.controls.organizations.setValue({
            preferredLabel:"",
            subOrganizationOf:"",
            status: "Active",
            typesMap: "",
            functionsMap: "",
            levels:"",
            foundationDate:"",
            terminationDate:"",
            mainAddress:{
                postCode:""
            },
            foundationFek:{
                year:""
            }

        });

        this.form.controls.organization_units.setValue({
            preferredLabel: "",
            typesMap: "",
            functionsMap: "",
            numOfSubunits: "",
            mainAddress:{
                postCode:""
            },
        });
  
        this.form.controls.remits.setValue({
            text: "",
            type: "",
            cofog1: "",
            cofog2: "",
            cofog3: "",
            status: "ΕΝΕΡΓΗ"
        });
    }

    buildSearchQuery(formGroup: FormGroup): any {
        const result = {};

        Object.keys(formGroup.controls).forEach(key => {
          const control = formGroup.get(key);
      
          if (control instanceof FormGroup) {
            const populatedFields = this.getPopulatedFields(control);
            const mustArray = [];

            Object.keys(populatedFields).forEach(fieldName => {
                mustArray.push({
                    field: fieldName,
                    type: "match",
                    query: fieldName ==="cofog1"  || fieldName ==="cofog2"  || fieldName ==="cofog3" ? this.getCofogName(fieldName) : populatedFields[fieldName]
                });
            });
      
            if (mustArray.length > 0) {
              result[key] = { must: mustArray };
            }
          }
        });
      
        return result;
      }

    // Method to get only populated fields from the form
    getPopulatedFields(formGroup: FormGroup): any {
        const filledData = {};
    
        Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
    
        if (control instanceof FormGroup) {
            // Recursive call if the control is a FormGroup
            const nestedData = this.getPopulatedFields(control);
            if (Object.keys(nestedData).length > 0) {
            filledData[key] = nestedData;
            }
        } else if (control instanceof FormControl && control.value) {
            // Include only if the control has a non-empty value
            filledData[key] = control.value;
        }
        });
    
        return filledData;
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
