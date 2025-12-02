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
    this.otaService.getUniqueOrganizationTypes().subscribe({
      next: (response) => {
        this.organizationTypes = response.body || [];
      },
      error: (error) => {
        console.error('Error fetching organization types:', error);
      }
    });
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
      remitLocalOrGlobal: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    this.rowData = [];
    if (this.form.valid) {
      console.log('Form Data1:', this.form.getRawValue()); 
      this.rowData = this.transformData(this.form.getRawValue());
      console.log("transformData", this.rowData)
    } else {
      console.log('Form is invalid');
    }
  }
  resetForm() {
    this.initializeForm();
    this.rowData = null
    this.cofog1_selected = false;
    this.cofog2_selected = false;
    this.loading = false
  }

  transformData(input: any) {
    const result: any = {
      facilities: { must: [] },
      spaces: { must: [] },
      equipments: { must: [] }
    };

    const pushCond = (section: string, cond: any) => {
      if (cond) result[section].must.push(cond);
    };

    // === FACILITIES ===
    if (input.facilities) {
      const f = input.facilities;
      let facilityExist = false;
      
      if (f.organization) {
        pushCond("facilities", {
          field: "organization",
          type: f.organizationSearch || "phrase",
          query: f.organization.trim()
        });
        facilityExist = true;
      }

      if (f.distinctiveNameOfFacility) {
        pushCond("facilities", {
          field: "distinctiveNameOfFacility",
          type: "words",
          query: f.distinctiveNameOfFacility.trim()
        });
        facilityExist = true;
      }

      if (f.kaek) {
        pushCond("facilities", { field: "kaek", type: "words", query: f.kaek });
        facilityExist = true;
      }

      if (Array.isArray(f.useOfFacility) && f.useOfFacility.length ) {
        let useOfFacility = []
        f.useOfFacility.forEach((use: string) => {
          useOfFacility.push(use);
          // pushCond("facilities", { field: "useOfFacility", type: "words", query: use });
        });
        pushCond("facilities", { field: "useOfFacility", type: "words", query: useOfFacility });
        facilityExist = true;
      }

      if (f.coveredPremisesArea.from || f.coveredPremisesArea.until) {
        const areaQuery: any = {};

        if (f.coveredPremisesArea.from) {
          areaQuery.gte = f.coveredPremisesArea.from;
        }

        if (f.coveredPremisesArea.until) {
          areaQuery.lte = f.coveredPremisesArea.until;
        }

        pushCond("facilities", { 
          field: "coveredPremisesArea", 
          query:areaQuery 
        });
        facilityExist = true;
      }

      if (f.floorsOrLevels.from || f.floorsOrLevels.until) {
        const floorOrLevelQuery: any = {};

        if (f.floorsOrLevels.from) {
          floorOrLevelQuery.gte = f.floorsOrLevels.from;
        }

        if (f.floorsOrLevels.until) {
          floorOrLevelQuery.lte = f.floorsOrLevels.until;
        }

        pushCond("facilities", { 
          field: "floorsOrLevels", 
          query: floorOrLevelQuery 
         });
        facilityExist = true;
      }

      // Join addressOfFacility fields
      if (f.addressOfFacility.street || f.addressOfFacility.number || f.addressOfFacility.postcode || f.addressOfFacility.area || f.addressOfFacility.municipality || f.addressOfFacility.geographicRegion) {
        const addrParts = [
          f.addressOfFacility.street,
          f.addressOfFacility.number,
          f.addressOfFacility.postcode,
          f.addressOfFacility.area,
          f.addressOfFacility.municipality,
          f.addressOfFacility.geographicRegion,
          f.addressOfFacility.country
        ].filter(Boolean);
        if (addrParts.length) {
          pushCond("facilities", {
            field: "addressOfFacility",
            type: "words",
            query: addrParts.join(", ")
          });
        }
        facilityExist = true;
      }

      // booleans (uniqueUseOfFacility, private)
      if (facilityExist) {
        ["uniqueUseOfFacility", "private"].forEach((field) => {
          if (f[field] !== undefined) {
            pushCond("facilities", { field, type: "words", query: f[field] });
          }
        });
      }
    }

    // === SPACES ===
    if (input.spaces) {
      const s = input.spaces;
      
      if (s.organization) {
        pushCond("spaces", { field: "organization", type: s.organizationSearch || "phrase", query: s.organization });
      }

      if (s.spaceName) {
        pushCond("spaces", { field: "spaceName", type: "words", query: s.spaceName });
      }

      if (Array.isArray(s.spaceUse) && s.spaceUse.length) {
        let spaceUse = []
        if (s.spaceUse.length==1 && s.spaceUse[0].type=='') {
          console.log(s.spaceUse.length, s.spaceUse[0].type);
        } else {
          // const joined = s.spaceUse
          // .map((su: any) => [su.type, su.subtype, su.space, su.auxiliarySpace].filter((x) => x !== "").join(","))
          // .join("$");
          // pushCond("spaces", { field: "spaceUse", type: "words", query: joined });
          spaceUse = s.spaceUse
            .map((su: any) => [su.type, su.subtype, su.space, su.auxiliarySpace]
            .filter((x) => x !== "").join(","))

        }
        if (spaceUse.length){
          pushCond("spaces", { field: "spaceUse", type: "words", query: spaceUse });
        }        
      }

      if (s.spaceArea.from || s.spaceArea.until) {
        const spaceAreaQuery: any = {};

        if (s.spaceArea.from) {
          spaceAreaQuery.gte = s.spaceArea.from;
        }

        if (s.spaceArea.until) {
          spaceAreaQuery.lte = s.spaceArea.until;
        }

        pushCond("spaces", { 
          field: "spaceArea", 
          query: spaceAreaQuery
        });
      }
    }

    // === EQUIPMENTS ===
    if (input.equipments) {
      const e = input.equipments;
      let equipmentExist = false;

      if (e.organization) {
        pushCond("equipments", { field: "organization", type: e.organizationSearch || "phrase", query: e.organization });
      }

      ["resourceSubcategory", "kind", "type", "status"].forEach((field) => {
        if (e[field]) {
          pushCond("equipments", { field, type: "words", query: e[field] });
        }
      });

      // Join itemDescription
      if (Array.isArray(e.itemDescription) && e.itemDescription.length) {
        // const joined = e.itemDescription
        //   .map((item: any) => `${item.description}=${item.value}`)
        //   .join("$");
        // pushCond("equipments", { field: "itemDescription", type: "words", query: joined });
         // Keep only items where item.value has data
        const validItems = e.itemDescription.filter(
          (item: any) => item?.value !== null && item?.value !== undefined && item?.value !== ""
        );
        // If no item has value → do NOT push condition
        if (validItems.length) {
          // Build query string only for valid items
          const itemDescription = validItems
            .map((item: any) => `${item.description}=${item.value}`)

          pushCond("equipments", {
            field: "itemDescription",
            type: "words",
            query: itemDescription,
          });
        }        
      }

      if (e.acquisitionDate.from || e.acquisitionDate.until) {
        const acquisitionDateQuery: any = {};

        if (e.acquisitionDate.from) {
          acquisitionDateQuery.gte = new Date(e.acquisitionDate.from).toISOString();
        }

        if (e.acquisitionDate.until) {
          acquisitionDateQuery.lte = new Date(e.acquisitionDate.until).toISOString();
        }

        pushCond("equipments", { 
          field: "acquisitionDate", 
            query: acquisitionDateQuery
          })
      }

      if (e.depreciationDate.from || e.depreciationDate.until) {
        const depreciationDateQuery: any = {};

        if (e.acquisitionDate.from) {
          depreciationDateQuery.gte = new Date(e.depreciationDate.from).toISOString();
        }

        if (e.acquisitionDate.until) {
          depreciationDateQuery.lte = new Date(e.depreciationDate.until).toISOString();
        }

        pushCond("equipments", { 
          field: "depreciationDate", 
          query: depreciationDateQuery
        });
      }
    }

    return result;
  }
}
