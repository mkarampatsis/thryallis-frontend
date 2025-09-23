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
  useOfFacilityForSpace: string[];
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
        this.useOfFacilityForSpace = result.map(item => item.type);
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
        organizationSearch: new FormControl('phrase'),
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
        organizationSearch: new FormControl('phrase'),
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
        organizationSearch: new FormControl('phrase'),
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
    this.updateUseOfFacilityData();
  }

  updateUseOfFacilityData() {
    console.log(">>",this.useOfFacilityArray.value);
    this.useOfFacilityForSpace = this.useOfFacilityArray.value;
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
    this.rowData = null;
    this.initializeForm(); 
  }

  submitForm() {
    this.rowData = [];
    if (this.form.valid) {
      // console.log('Form Data1:', this.form.getRawValue()); 
      this.rowData = this.transformData(this.form.getRawValue());
      console.log('Form Data2:',this.rowData)
    } else {
      console.log('Form is invalid');
    }
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

      if (f.kaek) {
        pushCond("facilities", { field: "kaek", type: "phrase", query: f.kaek });
        facilityExist = true;
      }

      if (Array.isArray(f.useOfFacility) && f.useOfFacility.length ) {
        let useOfFacility = []
        f.useOfFacility.forEach((use: string) => {
          useOfFacility.push(use);
          pushCond("facilities", { field: "useOfFacility", type: "phrase", query: use });
        });
        // pushCond("facilities", { field: "useOfFacility", type: "phrase", query: useOfFacility });
        facilityExist = true;
      }

      if (f.coveredPremisesArea.from || f.coveredPremisesArea.until) {
        pushCond("facilities", { field: "coveredPremisesArea", query: { gte: f.coveredPremisesArea.from, lte: f.coveredPremisesArea.until } });
        facilityExist = true;
      }

      // ✅ Join addressOfFacility fields
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
            type: "phrase",
            query: addrParts.join(", ")
          });
        }
        facilityExist = true;
      }

      // booleans (uniqueUseOfFacility, private)
      if (facilityExist) {
        ["uniqueUseOfFacility", "private"].forEach((field) => {
          if (f[field] !== undefined) {
            pushCond("facilities", { field, type: "phrase", query: f[field] });
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
        pushCond("spaces", { field: "spaceName", type: "phrase", query: s.spaceName });
      }

      if (Array.isArray(s.spaceUse) && s.spaceUse.length) {
        if (s.spaceUse.length==1 && s.spaceUse[0].type=='') {
          console.log(s.spaceUse.length, s.spaceUse[0].type);
        } else {
          const joined = s.spaceUse
          .map((su: any) => [su.type, su.subtype, su.space, su.auxiliarySpace].filter((x) => x !== "").join(","))
          .join("$");
          pushCond("spaces", { field: "spaceUse", type: "phrase", query: joined });
          // pushCond("spaces", { field: "spaceUse", type: "phrase", query: s.spaceUse });
        }        
      }

      if (s.spaceArea.from || s.spaceArea.until) {
        pushCond("spaces", { field: "spaceArea", query: { gte: s.spaceArea.from, lte: s.spaceArea.until} });
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
          pushCond("equipments", { field, type: "phrase", query: e[field] });
        }
      });

      // ✅ Join itemDescription
      if (Array.isArray(e.itemDescription) && e.itemDescription.length) {
        const joined = e.itemDescription
          .map((item: any) => `${item.description}=${item.value}`)
          .join("$");
        pushCond("equipments", { field: "itemDescription", type: "phrase", query: joined });
      }

      if (e.acquisitionDate.from || e.acquisitionDate.until) {
        pushCond("equipments", { 
          field: "acquisitionDate", 
            query: { 
              gte: e.acquisitionDate.from ? new Date(e.acquisitionDate.from).toISOString() : "",
              lte: e.acquisitionDate.until ? new Date(e.acquisitionDate.until).toISOString() : ""
            } 
          })
      }

      if (e.depreciationDate.from || e.depreciationDate.until) {
        pushCond("equipments", { 
          field: "depreciationDate", 
          query: { 
            gte: e.depreciationDate.from ? new Date(e.depreciationDate.from).toISOString() : "",
            lte: e.depreciationDate.unti ? new Date(e.depreciationDate.until).toISOString() : ""
          } 
        });
      }
    }

    return result;
  }
  
}
