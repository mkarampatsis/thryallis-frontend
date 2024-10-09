import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { ILoadingOverlayParams } from 'ag-grid-community';

@Component({
    selector: 'app-grid-loading-overlay',
    standalone: true,
    imports: [],
    templateUrl: './grid-loading-overlay.component.html',
    styleUrl: './grid-loading-overlay.component.css',
})
export class GridLoadingOverlayComponent implements ILoadingOverlayAngularComp {
    params: ILoadingOverlayParams & { loadingMessage: string };

    agInit(params: ILoadingOverlayParams & { loadingMessage: string }): void {
        this.params = params;
    }
}
