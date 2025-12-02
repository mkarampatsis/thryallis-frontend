import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-grid',
  standalone: true,
  imports: [],
  templateUrl: './search-grid.component.html',
  styleUrl: './search-grid.component.css'
})
export class SearchGridComponent {
  @Input() data: [] | null;
}
