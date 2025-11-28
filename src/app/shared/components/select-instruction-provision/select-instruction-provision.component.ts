import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';

import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { map, take } from 'rxjs';

import { IInstructionProvision } from 'src/app/shared/interfaces/instruction-provision/instruction-provision.interface';

import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { InstructionProvisionService } from '../../services/instruction-provision.service';
import { GridLoadingOverlayComponent } from '../../modals/grid-loading-overlay/grid-loading-overlay.component';

@Component({
  selector: 'app-select-instruction-provision',
  standalone: true,
  imports: [AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './select-instruction-provision.component.html',
  styleUrl: './select-instruction-provision.component.css'
})
export class SelectInstructionProvisionComponent {
  @Output() selectedInstructionProvisions = new EventEmitter<IInstructionProvision[]>();
  constService = inject(ConstService);
  instructionProvisionService = inject(InstructionProvisionService);
  modalService = inject(ModalService);
  instructionProvisions: IInstructionProvision[] = [];

  defaultColDef = this.constService.defaultColDef;
  rowSelection: 'single' | 'multiple' = 'multiple';

  colDefs = this.constService.INSTRUCTION_PROVISIONS_COL_DEFS;
  rowClassRules = this.constService.INSTRUCTION_PROVISIONS_ROW_CLASS_RULES;

  currentInstructionProvisions: IInstructionProvision[] = [];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση διατάξεων...' };

  gridApi: GridApi<IInstructionProvision>;

  onGridReady(params: GridReadyEvent<IInstructionProvision>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.instructionProvisionService
      .getAllInstructionProvisions()
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
        this.instructionProvisions = data;
        this.gridApi.hideOverlay();
      });
  }

  onSelectionChanged(): void {
    this.currentInstructionProvisions = this.gridApi.getSelectedRows();
  }

  onSelectedInstructionProvisions(): void {
    this.selectedInstructionProvisions.emit(this.currentInstructionProvisions);
  }

  newLegalProvision(): void {
    // this.modalService.newLegalProvision().subscribe((data) => {
    //     if (data) {
    //         this.gridApi.showLoadingOverlay();
    //         this.instructionProvisionService
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
    //                 this.instructionProvisions = data;
    //                 this.gridApi.hideOverlay();
    //             });
    //     }
    // });
  }
}
