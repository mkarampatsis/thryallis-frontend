import { Component, inject, OnDestroy, } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular} from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { Subscription, map, take } from 'rxjs';

import { IOrganizationUnitList } from '../../interfaces/organization-unit';

import { ConstService } from 'src/app/shared/services/const.service';

// Store
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/shared/state/app.state';
import { selectOrganizationalUnitByOrganizationCode$, selectOrganizationalUnitsLoading$, } from '../../state/organizational-units.state';

@Component({
  selector: 'app-organization-units-by-organization-code',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent ],
  templateUrl: './organization-units-by-organization-code.component.html',
  styleUrl: './organization-units-by-organization-code.component.css'
})
export class OrganizationUnitsByOrganizationCodeComponent implements OnDestroy {
  store = inject(Store);
  constService = inject(ConstService);

  modalRef: any;
  code: string;
  organizationalUnits: IOrganizationUnitList[] = [];

  isLoading$ = selectOrganizationalUnitsLoading$;

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
  organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = this.constService.ORGANIZATION_UNITS_COL_DEFS;
  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση μονάδων...' };

  gridApi: GridApi<IOrganizationUnitList>;

  subscriptions: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onGridReady(params: GridReadyEvent<IOrganizationUnitList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.subscriptions.push(
      this.store.select(selectOrganizationalUnitByOrganizationCode$(this.code))
        .subscribe((data) => {
          this.organizationalUnits = data.map((org) => {
            return {
              ...org,
              organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
              organization: this.organizationCodesMap.get(org.organizationCode),
              subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
            };
          });
          this.gridApi.hideOverlay();
        }),
    );
  }

  onRowDoubleClicked(event: any): void {
    this.modalRef.dismiss(event.data);
  }
}
