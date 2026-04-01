import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-remits-html-cell-renderer-show-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remits-html-cell-renderer-show-button.component.html',
  styleUrl: './remits-html-cell-renderer-show-button.component.css'
})
export class RemitsHtmlCellRendererShowButtonComponent implements ICellRendererAngularComp {
  params: any;
  isLongText = false;
  showFullText = false;
  
  modalService = inject(ModalService);
  
  agInit(params: any): void {
    this.params = params;
    const value = typeof params.value === 'string' ? params.value : '';
    
    if (value.length > 300) {
      this.isLongText = true;
    } else {
      this.isLongText = false;
    }
  }

  refresh(params: any): boolean {
    this.agInit(params);
    this.showFullText = false;
    return true;
  }

  toggleText(): void {
    this.modalService.showFullRemitText({ text: this.params.value, searchTerm: this.params.context?.searchTerm || '' });
  }
}
