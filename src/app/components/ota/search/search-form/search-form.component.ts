import { Component, inject } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchGridComponent } from '../search-grid/search-grid.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { ICofog2 } from 'src/app/shared/interfaces/cofog/cofog2.interface';
import { ICofog3 } from 'src/app/shared/interfaces/cofog/cofog3.interface';
import { Subscription } from 'rxjs';
import { OtaService } from 'src/app/shared/services/ota.service';
import { IOtaSearch } from 'src/app/shared/interfaces/ota/ota.interface';

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
  constOtaService = inject(ConstOtaService);
  otaService = inject(OtaService);
  
  loading = false;
  
  remitCompetences = this.constOtaService.REMIT_COMPETENCES;
  remitTypes = this.constOtaService.REMIT_TYPES;
  instructionTypes = this.constOtaService.INSTRUCTION_TYPES;
  organizationTypes: string[] =[]; 

  cofog1 = this.constOtaService.COFOG;
  cofog2: ICofog2[] = [];
  cofog3: ICofog3[] = [];
  cofog1_selected: boolean = false;
  cofog2_selected: boolean = false;

  rowData: [] | null;
  
  formSubscriptions: Subscription[] = [];

  form!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.createCofogSubscriptions();
    this.otaService.getUniqueOrganizationTypes().subscribe({
      next: (response) => {
        this.organizationTypes = response.body || [];
      },
      error: (error) => {
        console.error('Error fetching organization types:', error);
      }
    });    
  }

  ngOnDestroy(): void {
    this.formSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  initializeForm() {
    this.form = new FormGroup({
      remitText: new FormControl(''),
      remitCompetence: new FormControl(''),
      remitType: new FormControl(''),
      cofog1: new FormControl(''),
      cofog2: new FormControl(''),
      cofog3: new FormControl(''),
      publicPolicyAgency: new FormGroup({
        organization: new FormControl(''),
        organizationType: new FormControl(''),
      }),
      remitLocalOrGlobal: new FormControl(''),
    });
  }

  onSubmit() {
    this.rowData = [];
    if (this.form.valid) {
      console.log('Form Data:', this.form.getRawValue()); 
      this.rowData = this.transformData(this.form.getRawValue());
      console.log("transformData", this.rowData)
    } else {
      console.log('Form is invalid');
    }
  }

  resetForm() {
    this.initializeForm();
    this.createCofogSubscriptions();
    this.rowData = null
    this.cofog1_selected = false;
    this.cofog2_selected = false;
    this.loading = false
  }

  createCofogSubscriptions() {
    this.formSubscriptions.push(
      this.form.get('cofog1').valueChanges.subscribe((value) => {
        if (value) {
          this.form.get('cofog2').setValue('');
          this.cofog1_selected = true;
          this.cofog2_selected = false;
          this.cofog2 = this.constOtaService.COFOG.find((cofog) => cofog.code === value)?.cofog2 || [];
        }
      }),
    );

    this.formSubscriptions.push(
      this.form.get('cofog2').valueChanges.subscribe((value) => {
        if (value) {
          this.form.get('cofog3').setValue('');
          this.cofog2_selected = true;
          this.cofog3 = this.cofog2.find((cofog) => cofog.code === value)?.cofog3 || [];
        }
      }),
    );
  }
  
  transformData(input: IOtaSearch) {
    const result: any = {
      ota: { must: [] }
      // spaces: { must: [] },
      // equipments: { must: [] }
    };

    const pushCond = (section: string, cond: any) => {
      if (cond) result[section].must.push(cond);
    };

    if (input.remitText) {
      pushCond("ota", {
        field: "remitText",
        type: "phrase",
        query: input.remitText.trim()
      });
    };

    if (input.remitCompetence) {
      pushCond("ota", {
        field: "remitCompetence",
        type: "words",
        query: input.remitCompetence.trim()
      });
    };

    if (input.remitType) {
      pushCond("ota", {
        field: "remitText",
        type: "words",
        query: input.remitText.trim()
      });
    };

    if (input.publicPolicyAgency.organization) {
      pushCond("ota", {
        field: "publicPolicyAgency.organization",
        type: "words",
        query: input.publicPolicyAgency.organization.trim()
      });
    };

    if (input.publicPolicyAgency.organizationType) {
      pushCond("ota", {
        field: "publicPolicyAgency.organizationType",
        type: "words",
        query: input.publicPolicyAgency.organizationType.trim()
      });
    };

    if (input.remitLocalOrGlobal) {
      pushCond("ota", {
        field: "remitLocalOrGlobal",
        type: "words",
        query: input.remitLocalOrGlobal.trim()
      });
    };
    
    if (input.cofog1) {
      const cofog1 = this.cofog1.find((cofog) => cofog.code === input.cofog1);
      pushCond("ota", {
        field: "cofog1",
        type: "words",
        // query: cofog1.name
        query: input.cofog1.trim()
      });
    };

    if (input.cofog2) {
      const cofog2 = this.cofog2.find((cofog) => cofog.code === input.cofog2);
      pushCond("ota", {
        field: "cofog2",
        type: "words",
        query: input.cofog2.trim()
        // query: cofog2.name
      });
    };

    if (input.cofog3) {
      const cofog3 = this.cofog3.find((cofog) => cofog.code === input.cofog3);
      pushCond("ota", {
        field: "cofog3",
        type: "words",
        // query: cofog3.name
        query: input.cofog3.trim()
      });
    };
    return result;
  }
}
