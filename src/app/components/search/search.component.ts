import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css',
})
export class SearchComponent {
    search(event: any) {
        alert('Not implemented yet! ');
    }
}
