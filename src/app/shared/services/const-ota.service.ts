import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs';

import {
  ColDef,
  RowClassRules,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy
} from 'ag-grid-community';

import { IDictionaryType, IOrganizationCode, IOrganizationUnitCode } from 'src/app/shared/interfaces/dictionary';

import { DictionaryService } from 'src/app/shared/services/dictionary.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { CofogService } from 'src/app/shared/services/cofog.service';
import { ICofog } from '../interfaces/cofog/cofog.interface';
import { LegalProvisionsActionsComponent } from '../components/legal-provisions-actions/legal-provisions-actions.component';
import { LegalActsActionsComponent } from '../components/legal-acts-actions/legal-acts-actions.component';
import { ForeisActionIconsComponent } from '../components/foreis-action-icons/foreis-action-icons.component';
import { IOrganizationUnitPSPED } from '../interfaces/organization-unit/organizational-unit-psped.interface';

@Injectable({
  providedIn: 'root',
})
export class ConstOtaService {
  dictionaryService = inject(DictionaryService);
  organizationService = inject(OrganizationService);
  organizationalUnitService = inject(OrganizationalUnitService);
   

  ORGANIZATION_TYPES: IDictionaryType[] = [];
  ORGANIZATION_TYPES_MAP: Map<number, string> = new Map<number, string>();

  ORGANIZATION_UNIT_TYPES: IDictionaryType[] = [];
  ORGANIZATION_UNIT_TYPES_MAP: Map<number, string> = new Map<number, string>();

  ORGANIZATION_FUNCTIONS: IDictionaryType[] = [];
  ORGANIZATION_FUNCTIONS_MAP: Map<number, string> = new Map<number, string>();

  ORGANIZATION_CODES: IOrganizationCode[] = [];
  ORGANIZATION_CODES_MAP: Map<string, string> = new Map<string, string>();

  ORGANIZATION_UNIT_CODES: IOrganizationUnitCode[] = [];
  ORGANIZATION_UNIT_CODES_MAP: Map<string, string> = new Map<string, string>();

  ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP: Map<string, string> = new Map<string, string>();

  ORGANIZATION_UNIT_REMITS_FINALIZED: IOrganizationUnitPSPED[] = [];
  ORGANIZATION_UNIT_REMITS_FINALIZED_MAP: Map<string, boolean> = new Map<string, boolean>();

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
    { field: 'code', headerName: 'Κωδικός', flex: 0.5 },
    { field: 'preferredLabel', headerName: 'Μονάδα', flex: 1 },
    { field: 'organization', headerName: 'Φορέας', flex: 1 },
    { field: 'subOrganizationOf', headerName: 'Προϊστάμενη Μονάδα', flex: 1 },
    { field: 'organizationType', headerName: 'Τύπος', flex: 0.5 },
    { field: 'remitsFinalized', headerName: 'Αρμοδιότητες', flex: 0.5 },
    // { field: 'actionCell', headerName: 'Ενέργειες', cellRenderer: MonadesActionIconsComponent,  filter: false, sortable: false, floatingFilter:false, flex: 1, resizable: false},
  ];

  constructor() {
    this.organizationalUnitService
      .getAllOrganizationalUnits()
      .pipe(take(1))
      .subscribe((data) => {
        data.forEach((ou) => {
          const orgCode = ou.organizationCode;
          const orgUnitCode = ou.code;
          this.ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP.set(orgUnitCode, orgCode);
        });
        // console.log(
        //     'ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP',
        //     this.ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP,
        // );
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

    this.dictionaryService
      .getAllOrganizationUnitTypes()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_UNIT_TYPES = data;
        this.ORGANIZATION_UNIT_TYPES.forEach((x) => {
          this.ORGANIZATION_UNIT_TYPES_MAP.set(x.apografi_id, x.description);
        });
      });

    this.dictionaryService
      .getAllFunctions()
      .pipe(take(1))
      .subscribe((data) => {
        this.ORGANIZATION_FUNCTIONS = data;
        this.ORGANIZATION_FUNCTIONS.forEach((x) => {
          this.ORGANIZATION_FUNCTIONS_MAP.set(x.apografi_id, x.description);
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

    this.organizationalUnitService
      .getAllMonadesPsped()
      .pipe(take(1))
      .subscribe((data) => {
        // console.log('PSPED MONADES', data);
        this.ORGANIZATION_UNIT_REMITS_FINALIZED = data;
        this.ORGANIZATION_UNIT_REMITS_FINALIZED.forEach((x) => {
          this.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP.set(x.code, x.remitsFinalized);
          // console.log('PSPED MONADES MAP', this.ORGANIZATION_UNIT_REMITS_FINALIZED_MAP);
        });
      });
  }

  getOrganizationTypeById(id: number): string | undefined {
    return this.ORGANIZATION_TYPES.find((x) => x.apografi_id === id)?.description;
  }

  getOrganizationPrefferedLabelByCode(code: string): string | undefined {
    return this.ORGANIZATION_CODES.find((x) => x.code === code)?.preferredLabel;
  }

  getOrganizationUnitPrefferedLabelByCode(code: string): string | undefined {
    return this.ORGANIZATION_UNIT_CODES.find((x) => x.code === code)?.preferredLabel;
  }

  getOrganizationUnitRemitsFinalizedByCode(code: string): boolean | undefined {
    return this.ORGANIZATION_UNIT_REMITS_FINALIZED.find((x) => x.code === code)?.remitsFinalized;
  }

  removeAccents(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
