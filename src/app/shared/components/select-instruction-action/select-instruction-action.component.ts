import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';
import { InstructionActsActionsComponent } from '../instruction-acts-actions/instruction-acts-actions.component';
import { IInstructionAct } from 'src/app/shared/interfaces/instruction-act/instruction-act.interface';

import { ConstService } from 'src/app/shared/services/const.service';
import { InstructionActService } from '../../services/instruction-act.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { GridLoadingOverlayComponent } from '../../modals/grid-loading-overlay/grid-loading-overlay.component';


@Component({
  selector: 'app-select-instruction-action',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './select-instruction-action.component.html',
  styleUrl: './select-instruction-action.component.css'
})
export class SelectInstructionActionComponent {
  @Output() selectedInstructionAct = new EventEmitter<string>();
  constService = inject(ConstService);
  instructionActService = inject(InstructionActService);
  modalService = inject(ModalService);
  instructionActs: IInstructionAct[] = [];

  defaultColDef = this.constService.defaultColDef;
  rowSelection: 'single' | 'multiple' = 'single';

  colDefs = this.constService.INSTRUCTION_ACTS_COL_DEFS;

  currentInstructionAct: IInstructionAct;

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση νομικών πράξεων...' };

  gridApi: GridApi<IInstructionAct>;

  onGridReady(params: GridReadyEvent<IInstructionAct>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.instructionActService
      .getAllInstructionActs()
      .pipe(
        take(1),
        map((data) => {
          return data.map((instructionAct) => {
            return {
              ...instructionAct,
            };
          });
        }),
      )
      .subscribe((data) => {
        this.instructionActs = data;
        this.gridApi.hideOverlay();
      });
  }

  onSelectionChanged(): void {
    const selectedRows = this.gridApi.getSelectedRows();
    this.currentInstructionAct = selectedRows[0];
  }

  onSelectedInstructionAct(): void {
    this.selectedInstructionAct.emit(this.currentInstructionAct.instructionActKey);
  }

  onRowDoubleClicked(event: any): void {
    this.selectedInstructionAct.emit(event.data.instructionActKey);
  }

  newInstructionAct(): void {
    this.modalService.newInstructionAct().subscribe((data) => {
      if (data) {
        this.gridApi.showLoadingOverlay();
        this.instructionActService
          .getAllInstructionActs()
          .pipe(
            take(1),
            map((data) => {
              return data.map((instructionAct) => {
                return {
                  ...instructionAct,
                };
              });
            }),
          )
          .subscribe((data) => {
            console.log(data);
            this.instructionActs = data;
            this.gridApi.hideOverlay();
          });
      }
    });
  }
}
