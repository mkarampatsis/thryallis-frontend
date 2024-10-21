import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { ConstService } from 'src/app/shared/services/const.service';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css'
})
export class MatrixComponent {
    constService = inject(ConstService);
    store = inject(Store<AppState>);
    organizations$ = selectOrganizations$;

    foreis: IOrganizationList[] = [];

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    form = new FormGroup({
        organization_1: new FormControl('', Validators.required),
        organization_2: new FormControl('', Validators.required),
    });
    
    ngOnInit(){
        this.store
            .select(selectOrganizations$)
            .pipe(take(1))
            .subscribe((data) => {
                this.foreis = data.map((org) => {
                    return {
                        ...org,
                        organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
                        subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
                    };
                });
            });
    }

    onSubmit(){
        console.log(this.form.value)
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
