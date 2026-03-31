import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-remit-full-text-modal',
  standalone: true,
  imports: [],
  templateUrl: './remit-full-text-modal.component.html',
  styleUrl: './remit-full-text-modal.component.css'
})
export class RemitFullTextModalComponent {
  modalService = inject(ModalService);
  modalRef: any;

  text = '';
  searchTerm = '';
  expanded = false;

  highlightedText = '';

  init(data: { text: string; searchTerm: string }) {

    this.text = data.text;
    this.searchTerm = data.searchTerm;
    this.update();
  }

  update() {
    const base = this.text;

    if (!this.searchTerm) {
      this.highlightedText = base;
      return;
    }

    const escaped = this.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');

    this.highlightedText = base.replace(regex, m => `<mark>${m}</mark>`);
  }
}
