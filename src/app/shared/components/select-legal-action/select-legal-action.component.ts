import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';
import { LegalActsActionsComponent } from 'src/app/shared/components/legal-acts-actions/legal-acts-actions.component';

import { ILegalAct } from 'src/app/shared/interfaces/legal-act/legal-act.interface';

import { ConstService } from 'src/app/shared/services/const.service';
import { LegalActService } from 'src/app/shared/services/legal-act.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { GridLoadingOverlayComponent } from '../../modals/grid-loading-overlay/grid-loading-overlay.component';

@Component({
    selector: 'app-select-legal-action',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './select-legal-action.component.html',
    styleUrl: './select-legal-action.component.css',
})
export class SelectLegalActionComponent {
    @Output() selectedLegalAct = new EventEmitter<string>();
    constService = inject(ConstService);
    legalActService = inject(LegalActService);
    modalService = inject(ModalService);
    legalActs: ILegalAct[] = [];

    defaultColDef = this.constService.defaultColDef;
    rowSelection: 'single' | 'multiple' = 'single';

    colDefs = this.constService.LEGAL_ACTS_COL_DEFS;

    currentLegalAct: ILegalAct;

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση νομικών πράξεων...' };

    gridApi: GridApi<ILegalAct>;

    onGridReady(params: GridReadyEvent<ILegalAct>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.legalActService
            .getAllLegalActs()
            .pipe(
                take(1),
                map((data) => {
                    return data.map((legalAct) => {
                        return {
                            ...legalAct,
                        };
                    });
                }),
            )
            .subscribe((data) => {
                this.legalActs = data;
                this.gridApi.hideOverlay();
            });
    }

    onSelectionChanged(): void {
        const selectedRows = this.gridApi.getSelectedRows();
        this.currentLegalAct = selectedRows[0];
    }

    onSelectedLegalAct(): void {
        this.selectedLegalAct.emit(this.currentLegalAct.legalActKey);
    }

    newLegalAct(): void {
        this.modalService.newLegalAct().subscribe((data) => {
            if (data) {
                this.gridApi.showLoadingOverlay();
                this.legalActService
                    .getAllLegalActs()
                    .pipe(
                        take(1),
                        map((data) => {
                            return data.map((legalAct) => {
                                return {
                                    ...legalAct,
                                };
                            });
                        }),
                    )
                    .subscribe((data) => {
                        console.log(data);
                        this.legalActs = data;
                        this.gridApi.hideOverlay();
                    });
            }
        });
    }
}
