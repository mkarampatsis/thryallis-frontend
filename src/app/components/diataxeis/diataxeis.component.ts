import { Component, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { ConstService } from 'src/app/shared/services/const.service';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { map, take } from 'rxjs';

@Component({
    selector: 'app-diataxeis',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './diataxeis.component.html',
    styleUrl: './diataxeis.component.css',
})
export class DiataxeisComponent {
    constService = inject(ConstService);
    legalProvisionsService = inject(LegalProvisionService);
    modalService = inject(ModalService);
    legalProvisions: ILegalProvision[] = [];

    defaultColDef = this.constService.defaultColDef;

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

    // newLegalProvision(): void {
    //     this.modalService.newLegalProvision().subscribe((data) => {
    //         if (data) {
    //             this.gridApi.showLoadingOverlay();
    //             this.legalProvisionsService
    //                 .getAllLegalProvisions()
    //                 .pipe(
    //                     take(1),
    //                     map((data) => {
    //                         return data.map((legalAct) => {
    //                             return {
    //                                 ...legalAct,
    //                             };
    //                         });
    //                     }),
    //                 )
    //                 .subscribe((data) => {
    //                     this.legalProvisions = data;
    //                     this.gridApi.hideOverlay();
    //                 });
    //         }
    //     });
    // }
}
