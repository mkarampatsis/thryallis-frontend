import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellClassRules } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LogDataService } from 'src/app/shared/services/log-data.service';
// import { AppState } from 'src/app/shared/state/app.state';
// import { Store } from '@ngrx/store';
// import { selectRemits$, selectRemitsLoading$ } from 'src/app/shared/state/remits.state';
// import { Subscription, take } from 'rxjs';
import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
// import { selectOrganizationCodeByOrganizationalUnitCode$ } from 'src/app/shared/state/organizational-units.state';

// export interface IRemitExtended extends IRemit {
//   organizationCode: string;
//   organizationLabel: string;
//   organizationUnitLabel: string;
// }

@Component({
  selector: 'app-log-data',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './log-data.component.html',
  styleUrl: './log-data.component.css',
})
export class LogDataComponent {
  constService = inject(ConstService);
  modalService = inject(ModalService);
  logDataService = inject(LogDataService);

  loading:string = 'nothing';

  allChanges = [];
  allChangesByEntity = [];
  showEntityMessage: string = '';

  // remits: IRemitExtended[] = [];

  // store = inject(Store<AppState>);
  // remits$ = selectRemits$;
  // remitsLoading$ = selectRemitsLoading$;
  // selectOrganizationCodeByOrganizationalUnitCode$ = selectOrganizationCodeByOrganizationalUnitCode$;

  // organizationCodesMap = this.constService.ORGANIZATION_CODES_MAP;
  // organizationUnitCodesMap = this.constService.ORGANIZATION_UNIT_CODES_MAP;

  defaultColDef = this.constService.defaultColDef;
  // colDefs: ColDef[];
  remitColDefs: ColDef[] = this.logDataService.remitColDefs;

  autoSizeStrategy = this.constService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση αρμοδιοτήτων...' };

  // gridApi: GridApi<IRemitExtended>;
  gridApi!: GridApi<IRemit>;

  // subscriptions: Subscription[] = [];

  // ngOnDestroy(): void {
  //   this.subscriptions.forEach(sub => sub.unsubscribe());
  // }

  ngOnInit() {
    this.logDataService.getAllEntityNames().subscribe(data => {
      this.allChangesByEntity = data.data;
    });
  }

  // initializeColDefs() {
  //   this.colDefs = [
  //     {
  //       field: 'organizationLabel',
  //       headerName: 'Φορέας',
  //       flex: 1,
  //       cellClassRules: this.getCellClassRulesOrganizations(),
  //     },
  //     {
  //       field: 'organizationUnitLabel',
  //       headerName: 'Μονάδα',
  //       flex: 1,
  //       cellClassRules: this.getCellClassRulesOrganizationalUnits(),
  //     },
  //     { field: 'remitType', headerName: 'Τύπος', flex: 1 },
  //     {
  //       field: 'remitText',
  //       headerName: 'Αρμοδιότητα',
  //       flex: 6,
  //       cellRenderer: HtmlCellRenderer,
  //       autoHeight: true,
  //       cellStyle: { 'white-space': 'normal' },
  //     },
  //     // { field: 'who', headerName: 'Χρήστης', flex: 1 },
  //   ];
  // }

  onGridReady(params: GridReadyEvent<IRemit>): void {
    this.gridApi = params.api;
    // this.gridApi.showLoadingOverlay();
    // this.subscriptions.push(
    //   this.store.select(this.remits$).subscribe(data => {
    //     this.remits = data.map(remit => {
    //       const orgUnitCode = remit.organizationalUnitCode;
    //       const orgCode =
    //         this.constService.ORGANIZATION_UNIT_CODES_TO_ORGANIZATION_CODES_MAP.get(orgUnitCode);
    //       return {
    //         ...remit,
    //         organizationCode: orgCode,
    //         organizationLabel: this.organizationCodesMap.get(orgCode),
    //         organizationUnitLabel: this.organizationUnitCodesMap.get(remit.organizationalUnitCode),
    //       };
    //     });
    //     // console.log(">>",this.remits)
    //     this.gridApi.hideOverlay();
    //   }),
    // );
  }

  // getCellClassRulesOrganizations(): CellClassRules {
  //   return {
  //     'text-success': params =>
  //       this.allOrganizationChanges['data']['organizations'].includes(params.data.organizationCode),
  //   };
  // }

  // getCellClassRulesOrganizationalUnits(): CellClassRules {
  //   return {
  //     'text-success': params =>
  //       this.allOrganizationChanges['data']['organizationalUnits'].includes(
  //         params.data.organizationalUnitCode,
  //       ),
  //   };
  // }

  onCellClicked(event: any): void {
   console.log('Cell clicked', event.data); 
  //   if (event.colDef.field == 'organizationLabel') {
  //     this.modalService.showChangeDetails(event.data['organizationCode']);
  //   } else if (event.colDef.field == 'organizationUnitLabel') {
  //     this.modalService.showChangeDetails(event.data['organizationalUnitCode']);
  //   } else if (event.colDef.field == 'remitText') {
  //     this.modalService.showRemitDetails({
  //       organizationCode: event.data.organizationalUnitCode,
  //       remitId: event.data['_id']['$oid'],
  //     });
  //   }
  }

  // onRowDoubleClicked(event: any): void {
  //     // console.log(event);
  //     this.modalService.showOrganizationDetails(event.data.code);
  // }

  onEntityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const entity = select.value;

    this.loading = 'show';
    this.allChanges = [];

    if (entity) {
      this.logDataService.getAllChangesByEntity(entity)
      .subscribe(data => {
        this.allChanges = data.data;
        console.log('All changes for entity', entity, this.allChanges);
        // this.initializeColDefs()
        this.loading = 'not show';
      });
    }

    switch (entity) {
      case 'organization':
        this.showEntityMessage = '<strong>Αφορα αλλαγές που έγιναν στους φορείς, όπως αλλαγές στο <i>Επίπεδο Φορέα</i>, στο <i>Κείμενο Πρόβλεψης της Σύστασης</i> του φορέα ή στις <i>Διατάξεις Πρόβλεψεις</i>.</strong>';
        break;
      case 'organizationalUnit':
        this.showEntityMessage = '<strong>Αφορα αλλαγές που έγιναν στις μονάδες, όπως αλλαγές στο <i>Επίπεδο Μονάδας</i>, στο Κείμενο Πρόβλεψης της Σύστασης της Μονάδας ή στις <i>Διατάξεις Πρόβλεψεις</i>.</strong>';
        break;
      case 'remit':
        this.showEntityMessage = '<strong>Εμφανίζονται οι αλλαγές που έγιναν στις αρμοδιότητες.</strong>';
        break;
      default:
        this.showEntityMessage = '';
    } 
  }

  getEntityLabel(entity: string): string {
    const entityType = this.constService.ENTITY_TYPES.find(type => type.en === entity);
    return entityType?.gr ?? entity;
  }
}

@Component({
  selector: 'app-html-cell-renderer',
  standalone: true,
  imports: [NgIf],
  template: `
    <div
      [innerHTML]="shortText"
      *ngIf="!showFullText"></div>
    <div
      [innerHTML]="params.value"
      *ngIf="showFullText"></div>
    <button
      class="btn btn-info btn-sm mb-2"
      *ngIf="isLongText"
      (click)="toggleText()">
      {{ showFullText ? 'Σύμπτυξη' : 'Περισσότερα' }}
    </button>
  `,
})
export class HtmlCellRenderer implements ICellRendererAngularComp {
  params: any;
  showFullText = false;
  shortText = '';
  isLongText = false;

  agInit(params: any): void {
    this.params = params;
    if (this.params.value.length > 500) {
      this.shortText = this.params.value.substr(0, 500);
      this.isLongText = true;
    } else {
      this.shortText = this.params.value;
    }
  }

  refresh(params: any): boolean {
    this.params = params;
    if (this.params.value.length > 500) {
      this.shortText = this.params.value.substr(0, 500);
      this.isLongText = true;
    } else {
      this.shortText = this.params.value;
    }
    this.showFullText = false; // Reset the text display state
    return true;
  }

  toggleText(): void {
    this.showFullText = !this.showFullText;
  }
}
