import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpboxService } from 'src/app/shared/services/helpbox.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ColDef } from 'ag-grid-community';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AgGridAngular, GridLoadingOverlayComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit {
  helpboxService = inject(HelpboxService)
  sanitizer = inject(DomSanitizer);
  constService = inject(ConstService);
  modalService = inject(ModalService);

  publishedQuestions = []; 

    defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,
      floatingFilter: true,
      wrapText: true, // Wrap Text
      autoHeight: true,
      wrapHeaderText: true, // Wrap Header Text
      autoHeaderHeight: true,
  };
  colDefs: ColDef[] = [
    { 
      headerName: 'A/A', 
      cellRenderer : function (params) {
          return params.rowIndex +1;
      },
      flex:1 
    },
    { field: 'questionTitle', headerName: 'Τίτλος Συνομιλίας', flex:2 },
    { 
      field: 'questions.questionText', 
      headerName: 'Ερώτηση',
      cellRenderer: HtmlSanitizeRendererComponent,
      flex:3
    },
    { 
      field: 'questions.whenAsked', 
      headerName: 'Ημερ. ερωτήματος', 
      sortable: true, // sorting works on raw ISO string
      cellRenderer: (params) => {
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }, 
      flex:1 
    },
    { 
      field: 'questions.whenAnswered', 
      headerName: 'Απαντ. ερωτήματος',
      sortable: true, // sorting works on raw ISO string
      cellRenderer: (params) => {
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },            
      flex:1 
    },
  ];

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση ερωτημάτων...' };

  gridApi: GridApi<any>;
  
  ngOnInit(): void {
    this.helpboxService.getAllPublishedHelpbox()
      .subscribe((data)=>{
          this.publishedQuestions = data['data'];
      })
  }

  onGridReady(params: GridReadyEvent<any>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.loadData();
  }
    
  loadData(){
    this.helpboxService.getAllPublishedHelpbox()
    .subscribe((data)=>{
      this.publishedQuestions = data['data']
      this.gridApi.hideOverlay();
    })
  }

  onRowClicked(event: any): void {
    this.modalService.showFaqAnswer(event.data);
    console.log(event);
  }
}

@Component({
  selector: 'app-html-sanitize-renderer',
  template: `<div [innerHTML]="sanitizedHtml"></div>`
})
export class HtmlSanitizeRendererComponent implements ICellRendererAngularComp {
  sanitizedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  agInit(params: any): void {
    this.sanitizedHtml = this.sanitizeHtml(params.value);
  }

  refresh(): boolean {
    return false;
  }

  sanitizeHtml(html: string): SafeHtml {
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : '';
  }
}
