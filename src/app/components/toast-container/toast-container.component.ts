import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, NgbToastModule, NgTemplateOutlet],
    templateUrl: './toast-container.component.html',
    styleUrl: './toast-container.component.css',
    host: {
        class: 'toast-container position-fixed end-0 p-3',
        style: 'z-index: 1200; top: 75px;',
    },
})
export class ToastContainerComponent {
    toastService = inject(ToastService);
    toasts = this.toastService.toasts;
}
