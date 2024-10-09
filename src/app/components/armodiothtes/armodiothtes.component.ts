import { CommonModule, NgIf } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Subscription, take } from 'rxjs';

import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { RemitService } from 'src/app/shared/services/remit.service';
import { AppState } from 'src/app/shared/state/app.state';
import { selectRemits$, selectRemitsLoading$ } from 'src/app/shared/state/remits.state';
import { selectOrganizationCodeByOrganizationalUnitCode$ } from 'src/app/shared/state/organizational-units.state';

export interface IRemitExtended extends IRemit {
    organizationLabel: string;
    organizationUnitLabel: string;
}

@Component({
    selector: 'app-armodiothtes',
    standalone: true,
    imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './armodiothtes.component.html',
    styleUrl: './armodiothtes.component.css',
})
export class ArmodiothtesComponent implements OnDestroy {
    constService = inject(ConstService);
    remitsService = inject(RemitService);
    remits: IRemitExtended[] = [];

    store = inject(Store<AppState>);
    remits$ = selectRemits$;
    remitsLoading$ = selectRemitsLoading$;
    selectOrganizationCodeByOrganizationalUnitCode$ = selectOrganizationCodeByOrganizationalUnitCode$;

    organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
    organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;

    defaultColDef = this.constService.defaultColDef;
    colDefs: ColDef[] = [
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

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

    gridApi: GridApi<IRemitExtended>;

    subscriptions: Subscription[] = [];

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    onGridReady(params: GridReadyEvent<IRemitExtended>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.subscriptions.push(
            this.store.select(this.remits$).subscribe((data) => {
                this.remits = data.map((remit) => {
                    // this.store
                    //     .select(this.selectOrganizationCodeByOrganizationalUnitCode$(remit.organizationalUnitCode))
                    //     .pipe(take(1))
                    //     .subscribe((orgCode) => {
                    //         console.log('orgCode', orgCode);
                    //     });
                    const orgUnitCode = remit.organizationalUnitCode;
                    const orgCode =
                        this.constService.ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP.get(orgUnitCode);
                    return {
                        ...remit,
                        organizationLabel: this.organizationCodesMap.get(orgCode),
                        organizationUnitLabel: this.organizationUnitCodesMap.get(remit.organizationalUnitCode),
                    };
                });
                this.gridApi.hideOverlay();
            }),
        );
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
