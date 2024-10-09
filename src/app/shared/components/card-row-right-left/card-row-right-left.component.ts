import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-card-row-right-left',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-row-right-left.component.html',
    styleUrl: './card-row-right-left.component.css',
})
export class CardRowRightLeftComponent {
    @Input() keyValue: {
        key: string;
        value: string | string[] | undefined;
    } = {
        key: '',
        value: undefined,
    };

    isArray(value: string | string[] | undefined): boolean {
        return Array.isArray(value);
    }

    isDate(value: any): boolean {
        return value instanceof Date || !isNaN(Date.parse(value));
    }

    isDateString(value: any): value is string | Date {
        return typeof value === 'string' || value instanceof Date;
    }
}
