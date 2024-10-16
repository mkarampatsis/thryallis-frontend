import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchFormComponent } from './search-form/search-form.component';
import { MatrixComponent } from './matrix/matrix.component';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [NgbNavModule, SearchFormComponent, MatrixComponent],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css',
})
export class SearchComponent {
    active = 1;
}