import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs';

import {
  ColDef,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy
} from 'ag-grid-community';

import { IDictionaryType, IOrganizationCode } from 'src/app/shared/interfaces/dictionary';

import { DictionaryService } from 'src/app/shared/services/dictionary.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { ICofog } from '../interfaces/cofog/cofog.interface';
import { CofogService } from 'src/app/shared/services/cofog.service';
import { InstructionActsActionsComponent } from '../components/instruction-acts-actions/instruction-acts-actions.component';

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

  REMIT_COMPETENCES = [
    'Περιφέρειες',
    'Δήμοι',
    'Νησιωτικοί Δήμοι',
    'Ορεινοί Δήμοι',
    // 'Μητροπολιτικές Αρμοδιότητες'
  ];

  REMIT_TYPES = [
    'Επιτελική',
    'Εκτελεστική',
    'Υποστηρικτική',
    'Ελεγκτική',
    'Παρακολούθησης αποτελεσματικής πολιτικής και αξιολόγησης αποτελεσμάτων'
  ];

  INSTRUCTION_TYPES = [
    'Εγκύκλιος',
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

  INSTRUCTION_ACTS_COL_DEFS: ColDef[] = [
    {
      field: 'instructionActType',
      headerName: 'Τύπος',
      flex: 1,
    },
    { field: 'instructionActNumber', headerName: 'Αριθμός', flex: 1 },
    { field: 'instructionActDate', headerName: 'Ημερομηνία', flex: 1 },
    {
      valueGetter: function (params) {
        if (params.data.ada.startsWith('ΜΗ ΑΝΑΡΤΗΤΕΑ ΠΡΑΞΗ-')) {
          return params.data.ada.split('-', 2)[0];
        } else {
          return params.data.ada;
        }
      },
      field: 'ada',
      headerName: 'ΑΔΑ',
      flex: 1,
    },
    {
      field: 'actionCell',
      headerName: 'Ενέργειες',
      cellRenderer: InstructionActsActionsComponent,
      filter: false,
      sortable: false,
      floatingFilter: false,
      flex: 1,
      resizable: false,
    },
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

  getCofogNames(cofog1Code: string, cofog2Code: string, cofog3Code: string): string[] | null {
    const cofog1 = this.COFOG.find((cofog) => cofog.code === cofog1Code);
    if (!cofog1) return null;

    const cofog2 = cofog1.cofog2.find((cofog) => cofog.code === cofog2Code);
    if (!cofog2) return null;

    const cofog3 = cofog2.cofog3.find((cofog) => cofog.code === cofog3Code);
    if (!cofog3) return null;

    return [cofog1.name, cofog2.name, cofog3.name];
  }
  
  removeAccents(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
