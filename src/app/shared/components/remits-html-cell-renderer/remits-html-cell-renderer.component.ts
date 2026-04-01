import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-remits-html-cell-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remits-html-cell-renderer.component.html',
  styleUrl: './remits-html-cell-renderer.component.css'
})
export class RemitsHtmlCellRendererComponent implements ICellRendererAngularComp {
  params: any;
  showFullText = false;
  shortText = '';
  fullText = '';

  agInit(params: any): void {
    this.params = params;
    const value = typeof params.value === 'string' ? params.value : '';
    this.fullText = value;
    
    if (value.length > 300) {
      this.shortText = value.substring(0, 200) + '...';
    } else {
      this.shortText = value;

    }
  }

  highlight(text: string) {
    if (!this.params.context?.searchTerm) return text;

    const term = this.params.context.searchTerm;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');

    return text.replace(regex, match => `<mark>${match}</mark>`);
  }

  refresh(params: any): boolean {
    this.agInit(params);
    this.showFullText = false;
    return true;
  }
}
