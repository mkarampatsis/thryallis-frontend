import { Component, inject } from '@angular/core';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { Subscription, take } from 'rxjs';

import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { OrganizationTreeReportComponent } from 'src/app/shared/components/organization-tree-report/organization-tree-report.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [AgGridAngular, OrganizationTreeReportComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  constService = inject(ConstService);
  store = inject(Store<AppState>);

  subscriptions: Subscription[] = [];

  organizational_units$ = selectOrganizationalUnits$;
  loading = false;
  showReport = false;
  showReportText = '';

  monades: IOrganizationUnitList[] = [];

  organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
  organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

  defaultColDef = this.constService.defaultColDef;
  colDefs: ColDef[] = [
    { field: 'code', headerName: 'Κωδικός', flex: 0.5 },
    { field: 'organization', headerName: 'Φορέας', flex: 1 },
    { field: 'preferredLabel', headerName: 'Μονάδα', flex: 1 },
    { field: 'subOrganizationOf', headerName: 'Προϊστάμενη Μονάδα', flex: 1 },
    { field: 'organizationType', headerName: 'Τύπος', flex: 0.5 },
    {
      field: 'remitsFinalized',
      headerName: 'Κατάσταση Αρμοδιοτητων',
      flex: 0.5,
      cellRenderer: function (params) {
        return params.value ? "Ολοκληρώθηκαν" : 'Σε επεξεργασία';
      },
      cellStyle: params => {
        if (params.value) {
          return { color: 'green' };
        } else {
          return { color: 'red' };
        }
      },
    },
  ];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

  gridApiOrganization: GridApi<IOrganizationList>;
  gridApiOrganizationalUnit: GridApi<IOrganizationList>;

  selectedData = []
  matrixData = []
  showTable = false

  organizationCode: string | null = null;
  code: string | null = null;
  organizationName: string | null = null

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApiOrganizationalUnit = params.api;
    this.gridApiOrganizationalUnit.showLoadingOverlay();
    this.subscriptions.push(
      this.store.select(this.organizational_units$).subscribe((data) => {
        this.monades = data.map((org) => {
          return {
            ...org,
            organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
            organization: this.organizationCodesMap.get(org.organizationCode),
            subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
          };
        });
        this.gridApiOrganizationalUnit.hideOverlay();
      }),
    )
  }

  onCellClicked(event: any): void {

    this.organizationCode = event.data['organizationCode']
    this.organizationName = event.data['organization']

    this.showReport = false;
    this.showReportText = ''

    if (event.colDef.field == "preferredLabel") {
      this.code = event.data['code'];
      this.showReport = true;
      this.showReportText = event.data['preferredLabel'];
    } else if (event.colDef.field == "organization") {
      this.code = event.data['organizationCode'];
      this.showReport = true;
      this.showReportText = event.data['organization'];
    } else if (event.colDef.field == "subOrganizationOf") {
      this.code = event.data['supervisorUnitCode'];
      this.showReport = true;
      this.showReportText = event.data['subOrganizationOf'];
    } else {
      this.showReport = false;
      this.showReportText = ''
    }
  }

  clearSelection() {
    this.code = null;
    this.showReportText = ''
    this.showReport = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
