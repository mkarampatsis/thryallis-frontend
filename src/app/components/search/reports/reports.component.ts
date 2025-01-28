import { Component, inject } from '@angular/core';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions  } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { Subscription, take } from 'rxjs';

import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { OrganizationTreeComponent } from 'src/app/shared/components/organization-tree/organization-tree.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [AgGridAngular, OrganizationTreeComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
    constService = inject(ConstService);
    store = inject(Store<AppState>);

    subscriptions: Subscription[] = [];
    
    organizational_units$ = selectOrganizationalUnits$;
    loading = false; 

    monades: IOrganizationUnitList[] = [];
    
    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
    organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = [
        { field: 'code', headerName: 'Κωδικός', flex: 0.5 },
        { field: 'preferredLabel', headerName: 'Ονομασία', flex: 1 },
        { field: 'organization', headerName: 'Φορέας', flex: 1 },
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
                    return {color: 'green'};
                } else {
                    return {color: 'red'};
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

    onCellClicked(event: any): void  {
        const selectedNodes = event.api.getSelectedNodes();
        console.log(selectedNodes[0].data);
        console.log(event.colDef.field)
        if (event.colDef.field=="preferredLabel") {
            console.log("1>>>",event.data['code'])
        } else if (event.colDef.field=="organization") {
            console.log("2>>>",event.data['organizationCode'])
            this.organizationCode = event.data['organizationCode']
        } else if (event.colDef.field=="subOrganizationOf") {
            console.log("3>>>",event.data['supervisorUnitCode'])
        } else {
            console.log("Nothing to show")
        }
    }

    clearSelectionMatrix1() {
        if (this.gridApiOrganization) {
            this.gridApiOrganization.deselectAll(); // Clear all selected rows
            this.gridApiOrganization.setFilterModel(null);
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    
}
