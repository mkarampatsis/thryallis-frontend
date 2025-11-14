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

  
  ORGANIZATION_UNITS_COL_DEFS_CHECKBOXES: ColDef[] = [
    { headerName: 'Επιλογή', headerCheckboxSelection: false, checkboxSelection: true, flex: 0.5 },
    { field: 'code', headerName: 'Κωδικός Μονάδας', flex: 0.5 },
    { field: 'preferredLabel', headerName: 'Μονάδα', flex: 1 },
    { field: 'organizationType', headerName: 'Τύπος Μονάδας', flex: 0.5 },
    { field: 'subOrganizationOf', headerName: 'Προϊστάμενη Μονάδα', flex: 1 },
    { field: 'organization', headerName: 'Φορέας', flex: 1 },
    { field: 'organizationCode', headerName: 'Κωδικός Φορέα', flex: 1 }
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
