import {ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { INoRowsOverlayAngularComp } from 'ag-grid-angular';
import type { INoRowsOverlayParams } from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams;

@Component({
  selector: 'app-ag-grid-no-rows-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './ag-grid-no-rows-overlay.component.html',
  styleUrl: './ag-grid-no-rows-overlay.component.css'
})
export class AgGridNoRowsOverlayComponent implements INoRowsOverlayAngularComp {
  noRowsMessage = signal('');

  agInit(params: CustomNoRowsOverlayParams): void {
    console.log("No Data to Grid");
  }

    
}
