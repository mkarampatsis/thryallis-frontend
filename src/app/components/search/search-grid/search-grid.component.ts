import { Component, inject, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ISearchGrid } from 'src/app/shared/interfaces/search/search.interface';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-search-grid',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './search-grid.component.html',
  styleUrl: './search-grid.component.css'
})
export class SearchGridComponent {
    @Input() data: ISearchGrid[] | null;
    
    constService = inject(ConstService);
    modalService = inject(ModalService);

    defaultColDef = this.constService.defaultColDef;

    colDefs: ColDef[] = [
        { field: 'organizationCode', headerName: 'Κωδ. Φορέα', flex: 1, hide: true },
        { 
            field: 'organizationPreferredLabel', 
            headerName: 'Φορέας',
            valueFormatter: params => params.value.toUpperCase(),
            flex: 2 
        },
        { field: 'organizationObjectId', flex: 1, hide: true  },
        { field: 'organizationScore', headerName: 'Βαθ. Φορέα', flex: 1 },
  
        { field: 'organizationalUnitCode', headerName: 'Κωδ. Μονάδας', flex: 1, hide: true },
        { 
            field: 'organizationalUnitPreferredLabel', 
            headerName: 'Μονάδα', 
            valueFormatter: params => params.value.toUpperCase(),
            flex: 2 
        },
        { field: 'organizationalUnitObjectId', flex: 1, hide: true  },

        { 
            field: 'remitRemitText', 
            headerName: 'Αρμοδιότητα',
            flex: 4,
            cellRenderer: HtmlCellRenderer,
            autoHeight: true,
            cellStyle: { 'white-space': 'normal' }
        },
        { field: 'remitObjectId', flex: 1, hide: true },

        { field: 'organizationalUnitScore', headerName: 'Βαθ. Αρμοδ.', flex: 1, sort: 'desc' }
    ];

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αποτελεσμάτων...' };

    gridApi: GridApi;

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.gridApi.hideOverlay();
    }

    onCellClicked(event: any): void  {
        if (event.colDef.field!="organizationScore" && event.colDef.field!="organizationalUnitScore") {
            if (event.colDef.field === 'organizationPreferredLabel') {
                this.modalService.showOrganizationDetails(event.data.organizationCode);
            }
            else if (event.colDef.field === 'organizationalUnitPreferredLabel') {
                this.modalService.showOrganizationUnitDetails(event.data.organizationalUnitCode)
            } else {
                this.modalService.showRemitDetails({ 
                    organizationCode: event.data.organizationalUnitCode, 
                    remitId: event.data.remitObjectId 
                })
            }
        }
    }
}

@Component({
    selector: 'app-html-cell-renderer',
    standalone: true,
    imports: [NgIf],
    template: `
        <div :class="emphasis" 
            [innerHTML]="shortText"
            *ngIf="!showFullText"></div>
        <div :class="emphasis"
            [innerHTML]="params.value"
            *ngIf="showFullText"></div>
        <button
            class="btn btn-info btn-sm mb-2"
            *ngIf="isLongText"
            (click)="toggleText()">
            {{ showFullText ? 'Σύμπτυξη' : 'Περισσότερα' }}
        </button>
    `,
    styles: 'em { color: red }'
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