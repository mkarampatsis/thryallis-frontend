import { Component } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
    selector: 'app-pdf-viewer',
    standalone: true,
    imports: [NgxExtendedPdfViewerModule],
    templateUrl: './pdf-viewer.component.html',
    styleUrl: './pdf-viewer.component.css',
})
export class PdfViewerComponent {
    pdfURL: HTMLAnchorElement;
    modalRef: any;
}
