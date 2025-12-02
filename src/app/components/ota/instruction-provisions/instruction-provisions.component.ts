import { Component, OnInit, effect, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';

import { IInstructionAct } from 'src/app/shared/interfaces/instruction-act/instruction-act.interface';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';

import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { InstructionActService } from 'src/app/shared/services/instruction-act.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-instruction-provisions',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './instruction-provisions.component.html',
  styleUrl: './instruction-provisions.component.css'
})
export class InstructionProvisionsComponent {
  constOtaService = inject(ConstOtaService);
  modalService = inject(ModalService);
  instructionActService = inject(InstructionActService);
  authService = inject(AuthService);
  user = this.authService.user;
  instructionActs: IInstructionAct[] = [];

  instructionActsNeedUpdate = this.instructionActService.instructionActsNeedUpdate;

  defaultColDef = this.constOtaService.defaultColDef;

  colDefs = this.constOtaService.INSTRUCTION_ACTS_COL_DEFS;

  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση νομικών πράξεων...' };

  gridApi: GridApi<IInstructionAct>;

  constructor() {
    effect(
      () => {
        if (this.instructionActsNeedUpdate()) {
          this.gridApi.showLoadingOverlay();
          this.instructionActService
            .getAllInstructionActs()
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
              this.instructionActs = data;
              this.gridApi.hideOverlay();
            });
          this.instructionActsNeedUpdate.set(false);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    // console.log(this.instructionActsNeedUpdate());
  }

  onGridReady(params: GridReadyEvent<IInstructionAct>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.instructionActService
      .getAllInstructionActs()
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
        this.instructionActs = data;
        this.gridApi.hideOverlay();
      });
  }

  newInstructionAct(): void {
    this.modalService
      .newInstructionAct()
      .pipe(take(1))
      .subscribe((data) => {
        this.instructionActsNeedUpdate.set(true);
      });
  }
}
