import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationGridComponent } from '../organization-grid/organization-grid.component';
import { OrganizationUnitGridComponent } from '../organization-unit-grid/organization-unit-grid.component';
import { RemitGridComponent } from '../remit-grid/remit-grid.component';

import { take } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConstService } from 'src/app/shared/services/const.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { ISearch, Organization, OrganizationalUnit , Remit } from 'src/app/shared/interfaces/search/search.interface';


@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [NgbNavModule, ReactiveFormsModule, OrganizationGridComponent, OrganizationUnitGridComponent, RemitGridComponent],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent {
    active = 1;
    constService = inject(ConstService);
    searchService = inject(SearchService);

    organization_levels = this.constService.ORGANIZATION_LEVELS;
    organization_types_map = this.constService.ORGANIZATION_TYPES_MAP;
    organization_functions_map = this.constService.ORGANIZATION_FUNCTIONS_MAP;

    organization_unit_types_map = this.constService.ORGANIZATION_UNIT_TYPES_MAP;
    
    remit_type = this.constService.REMIT_TYPES;
    remit_cofog = this.constService.COFOG;

    elasticJSON_initial = {
        "organizations": {
            "must": []
        },
        "organizational_units":{
            "must":[]
        },
        "remits":{
            "must":[]
        }
    };

    rowData: ISearch | null;
    organizationResults: Organization[] | null
    organization_unitsResults: OrganizationalUnit[] | null
    remitResults: Remit[] | null

    form = new FormGroup({
        organization_preferredLabel: new FormControl('', Validators.required),
        organization_types_map: new FormControl('', Validators.required),
        organization_functions_map: new FormControl('', Validators.required),
        organization_subOrganizationOf: new FormControl('', Validators.required),
        organization_levels: new FormControl('', Validators.required),
        organization_status: new FormControl('', Validators.required),
        organization_units_preferredLabel: new FormControl('', Validators.required),
        organization_units_types_map: new FormControl('', Validators.required),
        organization_units_functions_map: new FormControl('', Validators.required),
        organization_units_num_of_subunits: new FormControl('', Validators.required),
        remit_text: new FormControl('', Validators.required),
        remit_type: new FormControl('', Validators.required),
        remit_cofog: new FormControl('', Validators.required),
        remit_status: new FormControl('', Validators.required)
    });

    ngOnInit() {
        this.form.controls.organization_status.setValue('Active');
        this.form.controls.remit_status.setValue('ΕΝΕΡΓΗ');
    }

    onSubmit() {
        let elasticJSON = JSON.parse(JSON.stringify(this.elasticJSON_initial));

        if (this.form.controls.organization_preferredLabel.value){
            elasticJSON['organizations']['must'].push({
                "field": "preferredLabel",
                "type": "match",
                "query": this.form.controls.organization_preferredLabel.value
            })
        }
        if (this.form.controls.organization_types_map.value){
            elasticJSON['organizations']['must'].push({
                "field": "organizationType",
                "type": "match",
                "query": this.form.controls.organization_types_map.value
            })
        }
        if (this.form.controls.organization_functions_map.value){
            elasticJSON['organizations']['must'].push({
                "field": "purpose",
                "type": "match",
                "query": this.form.controls.organization_functions_map.value
            })
        }
        if (this.form.controls.organization_subOrganizationOf.value){
            elasticJSON['organizations']['must'].push({
                "field": "subOrganizationOf",
                "type": "match",
                "query": this.form.controls.organization_subOrganizationOf.value
            })
        }
        if (this.form.controls.organization_levels.value){
            elasticJSON['organizations']['must'].push({
                "field": "level",
                "type": "match",
                "query": this.form.controls.organization_levels.value
            })
        }
        if (this.form.controls.organization_status.value!="Active"){
            elasticJSON['organizations']['must'].push({
                "field": "status",
                "type": "match",
                "query": this.form.controls.organization_status.value
            })
        }
        if (this.form.controls.organization_units_preferredLabel.value){
            elasticJSON['organizational_units']['must'].push({
                "field": "preferredLabel",
                "type": "match",
                "query": this.form.controls.organization_units_preferredLabel.value
            })
        }
        if (this.form.controls.organization_units_types_map.value){
            elasticJSON['organizational_units']['must'].push({
                "field": "unitType",
                "type": "match",
                "query": this.form.controls.organization_units_types_map.value
            })
        }
        if (this.form.controls.organization_units_functions_map.value){
            elasticJSON['organizational_units']['must'].push({
                "field": "purpose",
                "type": "match",
                "query": this.form.controls.organization_units_functions_map.value
            })
        }
        if (this.form.controls.organization_units_num_of_subunits.value){
            elasticJSON['organizational_units']['must'].push({
                "field": "numOfSubUnits",
                "type": "match",
                "query": this.form.controls.organization_units_num_of_subunits.value
            })
        }
        if (this.form.controls.remit_text.value){
            elasticJSON['remits']['must'].push({
                "field": "remitText",
                "type": "match",
                "query": this.form.controls.remit_text.value
            })
        }
        if (this.form.controls.remit_type.value){
            elasticJSON['remits']['must'].push({
                "field": "remitType",
                "type": "match",
                "query": this.form.controls.remit_type.value
            })
        }
        if (this.form.controls.remit_cofog.value){
            elasticJSON['remits']['must'].push({
                "field": "cofog",
                "type": "match",
                "query": this.form.controls.remit_cofog.value
            })
        }
        if (this.form.controls.remit_status.value!="ΕΝΕΡΓΗ"){
            elasticJSON['remits']['must'].push({
                "field": "status",
                "type": "match",
                "query": this.form.controls.remit_status.value
            })
        }

        if (elasticJSON.organizations.must.length===0)
            delete elasticJSON.organizations
        if (elasticJSON.organizational_units.must.length===0)
            delete elasticJSON.organization_units
        if (elasticJSON.remits.must.length===0)
            delete elasticJSON.remits

        this.searchService
            .postSearch(elasticJSON)
            .pipe(take(1))
            .subscribe((data) => {
                this.rowData = data;
                this.organizationResults = data['organizations']
                this.organization_unitsResults = data['organizational_units']
                this.remitResults = data['remits']
                // this.gridApi.setGridOption("rowData", data['organizations'])
            });
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
