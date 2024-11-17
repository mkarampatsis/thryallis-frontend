import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';
import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions  } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { SearchService } from 'src/app/shared/services/search.service';
import { Subscription, take } from 'rxjs';
import { selectRemits$, selectRemitsLoading$ } from 'src/app/shared/state/remits.state';
import { selectOrganizationCodeByOrganizationalUnitCode$ } from 'src/app/shared/state/organizational-units.state';

export interface IRemitExtended extends IRemit {
    organizationLabel: string;
    organizationUnitLabel: string;
}

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css'
})
export class MatrixComponent {
    constService = inject(ConstService);
    
    store = inject(Store<AppState>);
    organizations$ = selectOrganizations$;
    organizational_units$ = selectOrganizationalUnits$
    remits$ = selectRemits$;
    remitsLoading$ = selectRemitsLoading$;
    selectOrganizationCodeByOrganizationalUnitCode$ = selectOrganizationCodeByOrganizationalUnitCode$;

    searchService = inject(SearchService)

    foreis: IOrganizationList[] = [];
    monades: IOrganizationUnitList[] = [];
    remits: IRemitExtended[] = [];

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationTypesMap = this.constService.ORGANIZATION_TYPES_MAP;

    organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;
    organizationUnitTypesMap = this.constService.ORGANIZATION_UNIT_TYPES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs_Matrix1: ColDef[] = this.constService.ORGANIZATIONS_COL_DEFS_WITH_CHECKBOXES;
    colDefs_Matrix2: ColDef[] = this.constService.ORGANIZATION_UNITS_COL_DEFS_CHECKBOXES
    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };
    loadingOverlayComponentRemit = GridLoadingOverlayComponent;
    loadingOverlayComponentParamsRemit = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

    gridApi: GridApi<IOrganizationList>;
    gridApiRemit: GridApi<IRemitExtended>;

    subscriptions: Subscription[] = [];
    
    selectedRowLimit = 2;
    
    selectedDataMatrix1 = []
    matrixData1 = []
    showTable1 = false
    
    selectedDataMatrix2 = []
    matrixData2 = []
    showTable2 = false

    selectedDataMatrix3 = []
    matrixData3 = []
    showTable3 = false
    filteredRows = []

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    colDefs_Matrix3: ColDef[] = [
        { headerName: 'Επιλογή', headerCheckboxSelection: true, checkboxSelection: true, flex: 0.5 },
        { field: 'organizationLabel', headerName: 'Φορέας', flex: 1 },
        { field: 'organizationUnitLabel', headerName: 'Μονάδα', flex: 1 },
        { field: 'remitType', headerName: 'Τύπος', flex: 1 },
        {
            field: 'remitText',
            headerName: 'Κείμενο',
            flex: 6,
            cellRenderer: HtmlCellRenderer,
            autoHeight: true,
            cellStyle: { 'white-space': 'normal' },
        },
    ];

    //   MATRIX 1 
    onGridReady_Matrix1(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.store
            .select(this.organizations$)
            .pipe(take(1))
            .subscribe((data) => {
                this.foreis = data.map((org) => {
                    return {
                        ...org,
                        organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
                        subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
                    };
                });
                this.gridApi.hideOverlay();
            });
    }

    onRowSelected_Matrix1(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
      
        // Log selected rows to the console
        this.selectedDataMatrix1 = selectedNodes.map(node => node.data);
        this.matrixData1 = this.searchService.transformMatrixData_1(this.selectedDataMatrix1)
        if (this.matrixData1.length>0){
            this.showTable1 = true;
        } else {
            this.showTable1= false
        }
    }

    showMatrixData1(code:string, unitType:string){
        const result =  this.matrixData1.filter((data)=>{
            if (code===data.organizationCode && data.description===unitType)
                return data
        }) 
        if (result.length>0)
            return result[0]['count']
        else 
            return '-'
    }

    //   MATRIX 2 
    onGridReady_Matrix2(params: GridReadyEvent<IOrganizationList>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
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
                this.gridApi.hideOverlay();
            }),
        )
    }

    onRowSelected_Matrix2(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
      
        // Log selected rows to the console
        this.selectedDataMatrix2 = selectedNodes.map(node => node.data);
        this.matrixData2 = this.searchService.transformMatrixData_2(this.selectedDataMatrix2)

        if (this.matrixData2.length>0){
            this.showTable2 = true
        } else {
            this.showTable2 = false
        }
        
    }

    showMatrixData2(code:string, unitType:string){
        const result =  this.matrixData2.filter((data)=>{
            if (code===data.organizationCode && data.description===unitType)
                return data
        }) 

        if (result.length>0)
            return result[0]['count']
        else 
            return '-'
    }

    //   MATRIX 3 
    onGridReady_Matrix3(params: GridReadyEvent<IRemitExtended>): void {
        this.gridApiRemit = params.api;
        this.gridApiRemit.showLoadingOverlay();
        this.subscriptions.push(
            this.store.select(this.remits$).subscribe((data) => {
                this.remits = data.map((remit) => {
                    const orgUnitCode = remit.organizationalUnitCode;
                    const orgCode =
                        this.constService.ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP.get(orgUnitCode);
                    return {
                        ...remit,
                        organizationLabel: this.organizationCodesMap.get(orgCode),
                        organizationUnitLabel: this.organizationUnitCodesMap.get(remit.organizationalUnitCode),
                    };
                });
                this.gridApiRemit.hideOverlay();
            }),
        );
    }

    onRowSelected_Matrix3(event: any) {
        const selectedNodes = event.api.getSelectedNodes();
         
        // Disable further selections if the limit is reached
        if (selectedNodes.length >= this.selectedRowLimit) {
          event.api.forEachNode((node) => {
            if (!node.isSelected()) {
              node.selectable = false; // Disable checkbox for unselected rows
            }
          });
        } else {
          // Enable selection for all rows if under the limit
          event.api.forEachNode((node) => {
            node.selectable = true; // Re-enable checkbox
          });
        }

        // Log selected rows to the console
        this.selectedDataMatrix3 = selectedNodes.map(node => node.data);
        this.matrixData3 = this.searchService.transformMatrixData_3(this.selectedDataMatrix3, this.filteredRows)
        if (this.matrixData3.length>0){
            this.showTable3 = true
        } else {
            this.showTable3 = false
        }
        
    }

    onFilterChanged(event: any) {
        this.filteredRows = [];
        // let filteredRowCount = 0
         this.gridApiRemit.forEachNodeAfterFilter((data) => {
             this.filteredRows.push(data.data);
            //  filteredRowCount++;
         });
        //  console.log(filteredRowCount);
        // console.log(">>",this.filteredRows);
    }
}

@Component({
    selector: 'app-html-cell-renderer',
    standalone: true,
    imports: [NgIf],
    template: `
        <div
            [innerHTML]="shortText"
            *ngIf="!showFullText"></div>
        <div
            [innerHTML]="params.value"
            *ngIf="showFullText"></div>
        <button
            class="btn btn-info btn-sm mb-2"
            *ngIf="isLongText"
            (click)="toggleText()">
            {{ showFullText ? 'Σύμπτυξη' : 'Περισσότερα' }}
        </button>
    `,
})
export class HtmlCellRenderer implements ICellRendererAngularComp {
    params: any;
    showFullText = false;
    shortText = '';
    isLongText = false;

    agInit(params: any): void {
        this.params = params;
        if (this.params.value.length > 500) {
            this.shortText = this.params.value.substr(0, 500);
            this.isLongText = true;
        } else {
            this.shortText = this.params.value;
        }
    }

    refresh(params: any): boolean {
        this.params = params;
        if (this.params.value.length > 500) {
            this.shortText = this.params.value.substr(0, 500);
            this.isLongText = true;
        } else {
            this.shortText = this.params.value;
        }
        this.showFullText = false; // Reset the text display state
        return true;
    }

    toggleText(): void {
        this.showFullText = !this.showFullText;
    }
}