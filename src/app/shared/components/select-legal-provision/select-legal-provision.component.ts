import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';

import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';

import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';

import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { GridLoadingOverlayComponent } from '../../modals/grid-loading-overlay/grid-loading-overlay.component';

@Component({
    selector: 'app-select-legal-provision',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './select-legal-provision.component.html',
    styleUrl: './select-legal-provision.component.css',
})
export class SelectLegalProvisionComponent {
    @Output() selectedLegalProvisions = new EventEmitter<ILegalProvision[]>();
    constService = inject(ConstService);
    legalProvisionsService = inject(LegalProvisionService);
    modalService = inject(ModalService);
    legalProvisions: ILegalProvision[] = [];

    defaultColDef = this.constService.defaultColDef;
    rowSelection: 'single' | 'multiple' = 'multiple';

    colDefs = this.constService.LEGAL_PROVISIONS_COL_DEFS;
    rowClassRules = this.constService.LEGAL_PROVISIONS_ROW_CLASS_RULES;

    currentLegalProvisions: ILegalProvision[] = [];

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση διατάξεων...' };

    gridApi: GridApi<ILegalProvision>;

    onGridReady(params: GridReadyEvent<ILegalProvision>): void {
        this.gridApi = params.api;
        this.gridApi.showLoadingOverlay();
        this.legalProvisionsService
            .getAllLegalProvisions()
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
                this.legalProvisions = data;
                this.gridApi.hideOverlay();
            });
    }

    onSelectionChanged(): void {
        this.currentLegalProvisions = this.gridApi.getSelectedRows();
    }

    onSelectedLegalProvisions(): void {
        this.selectedLegalProvisions.emit(this.currentLegalProvisions);
    }

    newLegalProvision(): void {
        // this.modalService.newLegalProvision().subscribe((data) => {
        //     if (data) {
        //         this.gridApi.showLoadingOverlay();
        //         this.legalProvisionsService
        //             .getAllLegalProvisions()
        //             .pipe(
        //                 take(1),
        //                 map((data) => {
        //                     return data.map((legalAct) => {
        //                         return {
        //                             ...legalAct,
        //                         };
        //                     });
        //                 }),
        //             )
        //             .subscribe((data) => {
        //                 this.legalProvisions = data;
        //                 this.gridApi.hideOverlay();
        //             });
        //     }
        // });
    }
}
