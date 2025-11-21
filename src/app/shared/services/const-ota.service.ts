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

@Injectable({
  providedIn: 'root',
})
export class ConstOtaService {
  dictionaryService = inject(DictionaryService);
  organizationService = inject(OrganizationService);
  organizationalUnitService = inject(OrganizationalUnitService);
   
  ORGANIZATION_CODES: IOrganizationCode[] = [];
  ORGANIZATION_CODES_MAP: Map<string, string> = new Map<string, string>();
  
  ORGANIZATION_UNIT_TYPES: IDictionaryType[] = [];
  ORGANIZATION_UNIT_TYPES_MAP: Map<number, string> = new Map<number, string>();

  ORGANIZATION_UNIT_CODES: IOrganizationUnitCode[] = [];
  ORGANIZATION_UNIT_CODES_MAP: Map<string, string> = new Map<string, string>(); 

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
    { field: 'remitCompetence', headerName: 'Φορέας άσκησης', flex: 0.5 },
    { field: 'remitType', headerName: 'Τύπος αρμοδιότητας', flex: 0.5 },
    { field: 'remitLocalOrGlobal', headerName: 'Αυτοδιοικητική Αρμοδιότητα', flex: 1 },
    { field: 'publicPolicyAgency.organizationalUnit', headerName: 'Μονάδα Δημόσιας Πολιτικής', flex: 1 },
    { field: 'publicPolicyAgency.organization', headerName: 'Φορέας Δημόσιας Πολιτικής', flex: 1 },
    { field: 'remitText', headerName: 'Αρμοδιότητα', flex: 1 },
  ];

  
  OTA_COL_DEFS: ColDef[] = [
    { field: 'organization', headerName: 'Φορέας Δημόσιας Πολιτικής', flex: 1 },
    { field: 'organizationCode', headerName: 'Κωδικός Φορέα', flex: 0.3 },
    { field: 'preferredLabel', headerName: 'Μονάδα Δημόσιας Πολιτικής', flex: 1 }, 
    { field: 'code', headerName: 'Κωδικός Μονάδας', flex: 0.3 },   
  ];

  constructor() {
    
    this.dictionaryService
      .getAllOrganizationUnitTypes()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_UNIT_TYPES = data;
        this.ORGANIZATION_UNIT_TYPES.forEach((x) => {
          this.ORGANIZATION_UNIT_TYPES_MAP.set(x.apografi_id, x.description);
        });
      });

    this.organizationService
      .getAllOrganizationCodes()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_CODES = data;
        this.ORGANIZATION_CODES.forEach((x) => {
          this.ORGANIZATION_CODES_MAP.set(x.code, x.preferredLabel);
        });
      });


    this.organizationalUnitService
      .getAllOrganizationalUnitCodes()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_UNIT_CODES = data;
        this.ORGANIZATION_UNIT_CODES.forEach((x) => {
          this.ORGANIZATION_UNIT_CODES_MAP.set(x.code, x.preferredLabel);
        });
      });
  }  
}
