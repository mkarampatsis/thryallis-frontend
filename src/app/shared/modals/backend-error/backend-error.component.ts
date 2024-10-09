import { Component } from '@angular/core';

@Component({
    selector: 'app-backend-error',
    standalone: true,
    imports: [],
    templateUrl: './backend-error.component.html',
    styleUrl: './backend-error.component.css',
})
export class BackendErrorComponent {
    modalRef: any;
    message: string;
}
