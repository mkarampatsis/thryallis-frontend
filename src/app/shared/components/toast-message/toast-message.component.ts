import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-toast-message',
    standalone: true,
    imports: [],
    templateUrl: './toast-message.component.html',
    styleUrl: './toast-message.component.css',
})
export class ToastMessageComponent {
    @Input() message: string;
}
