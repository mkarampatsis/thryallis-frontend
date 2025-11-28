import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs';

import {
  ColDef,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy
} from 'ag-grid-community';

import { IDictionaryType, IOrganizationCode, IOrganizationUnitCode } from 'src/app/shared/interfaces/dictionary';

import { DictionaryService } from 'src/app/shared/services/dictionary.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { ICofog } from '../interfaces/cofog/cofog.interface';
import { CofogService } from 'src/app/shared/services/cofog.service';

@Injectable({
  providedIn: 'root',
})
export class ConstOtaService {
  dictionaryService = inject(DictionaryService);
  organizationService = inject(OrganizationService);
  organizationalUnitService = inject(OrganizationalUnitService);
  cofogService = inject(CofogService);
   
  ORGANIZATION_CODES: IOrganizationCode[] = [];
  ORGANIZATION_CODES_MAP: Map<string, string> = new Map<string, string>();
  
  ORGANIZATION_TYPES: IDictionaryType[] = [];
  ORGANIZATION_TYPES_MAP: Map<number, string> = new Map<number, string>();

  INSTRUCTION_TYPES = [
    'Εγκυκλιος',
    'Έγγραφο ',
  ];

  COFOG: ICofog[] = [];

  // AgGrid related constants
  defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    floatingFilter: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
  };

  autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = { type: 'fitCellContents' };


  OTA_DETAILS_COL_DEFS: ColDef[] = [
    { field: 'remitText', headerName: 'Αρμοδιότητα', flex: 1 },
    { field: 'remitLocalOrGlobal', headerName: 'Αυτοδιοικητική/Κρατική', flex: 1 },
    { field: 'remitType', headerName: 'Τύπος Αρμοδιότητας', flex: 0.5 },
    { field: 'remitCompetence', headerName: 'Φορέας Άσκησης', flex: 0.5 },
    { field: 'publicPolicyAgency.organization', headerName: 'Φορέας Δημόσιας Πολιτικής', flex: 1 },
    // { field: 'publicPolicyAgency.organizationalUnit', headerName: 'Μονάδα Δημόσιας Πολιτικής', flex: 1 }    
  ];

  
  OTA_COL_DEFS: ColDef[] = [
    {
      field: 'preferredLabel',
      headerName: 'Φορέας Δημόσιας Πολιτικής',
      flex: 4,
      filter: 'agTextColumnFilter',
      filterParams: {
        textMatcher: ({ value, filterText }) => {
          return value.indexOf(this.removeAccents(filterText)) !== -1;
        },
      },
    },
    { field: 'code', headerName: 'Κωδικός', flex: 1 },
    { field: 'organizationType', headerName: 'Τύπος', flex: 2 },
    { field: 'subOrganizationOf', headerName: 'Εποπτεύουσα Αρχή', flex: 2 }      
  ];

  constructor() {
    
    this.organizationService
      .getAllOrganizationCodes()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_CODES = data;
        this.ORGANIZATION_CODES.forEach((x) => {
          this.ORGANIZATION_CODES_MAP.set(x.code, x.preferredLabel);
        });
      });

    this.dictionaryService
      .getAllOrganizationTypes()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_TYPES = data;
        this.ORGANIZATION_TYPES.forEach((x) => {
          this.ORGANIZATION_TYPES_MAP.set(x.apografi_id, x.description);
        });
      });

    this.cofogService
      .getCofog()
      .pipe(take(1))
      .subscribe((data) => {
        this.COFOG = data.data;
      });
  } 
  
  removeAccents(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
