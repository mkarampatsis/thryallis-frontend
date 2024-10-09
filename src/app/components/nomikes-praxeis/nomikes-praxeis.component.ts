import { Component, OnInit, effect, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';

import { ILegalAct } from 'src/app/shared/interfaces/legal-act/legal-act.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

import { ConstService } from 'src/app/shared/services/const.service';
import { LegalActService } from 'src/app/shared/services/legal-act.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
    selector: 'app-nomikes-praxeis',
    standalone: true,
    imports: [AgGridAngular, GridLoadingOverlayComponent],
    templateUrl: './nomikes-praxeis.component.html',
    styleUrl: './nomikes-praxeis.component.css',
})
export class NomikesPraxeisComponent implements OnInit {
    constService = inject(ConstService);
    modalService = inject(ModalService);
    legalActService = inject(LegalActService);
    legalActs: ILegalAct[] = [];

    legalActsNeedUpdate = this.legalActService.legalActsNeedUpdate;

    defaultColDef = this.constService.defaultColDef;

    colDefs = this.constService.LEGAL_ACTS_COL_DEFS;

    autoSizeStrategy = this.constService.autoSizeStrategy;

    loadingOverlayComponent = GridLoadingOverlayComponent;
    loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση νομικών πράξεων...' };

    gridApi: GridApi<ILegalAct>;

    constructor() {
        effect(
            () => {
                if (this.legalActsNeedUpdate()) {
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
                    this.legalActsNeedUpdate.set(false);
                }
            },
            { allowSignalWrites: true },
        );
    }

    ngOnInit() {
        // console.log(this.legalActsNeedUpdate());
    }

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

    newLegalAct(): void {
        this.modalService
            .newLegalAct()
            .pipe(take(1))
            .subscribe((data) => {
                this.legalActsNeedUpdate.set(true);
            });
    }
}
