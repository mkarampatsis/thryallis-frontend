import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchFormComponent } from './search-form/search-form.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NgbNavModule, SearchFormComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  active = 1;
}
