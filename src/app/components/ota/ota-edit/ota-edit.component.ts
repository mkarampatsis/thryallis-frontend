import { Component, inject } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ListLegalProvisionsComponent } from 'src/app/shared/components/list-legal-provisions/list-legal-provisions.component';

import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { isEqual, uniqWith } from 'lodash-es';
import { Subscription } from 'rxjs';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { IOta } from 'src/app/shared/interfaces/ota/ota.interface';

import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';

import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { selectOrganizationalUnits$, } from 'src/app/shared/state/organizational-units.state';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-ota-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule, ListLegalProvisionsComponent, AgGridAngular],
  templateUrl: './ota-edit.component.html',
  styleUrl: './ota-edit.component.css'
})
export class OtaEditComponent{
  modalService = inject(ModalService);
  constOtaService = inject(ConstOtaService);
  sanitizer = inject(DomSanitizer);

  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;

  legalProvisions: ILegalProvision[] = [];
  instructionProvisions: ILegalProvision[] = [];
  showInfoText: string = '';

  ota: IOta = null;
  monades: IOrganizationUnitList[] = [];

  gridSelectedData = [];
  gridData = [];

  subscriptions: Subscription[] = [];
  store = inject(Store<AppState>);
  organizational_units$ = selectOrganizationalUnits$
  organizationUnitCodesMap = this.constOtaService.ORGANIZATION_UNIT_CODES_MAP;
  organizationUnitTypesMap = this.constOtaService.ORGANIZATION_UNIT_TYPES_MAP;
  organizationCodesMap = this.constOtaService.ORGANIZATION_CODES_MAP;

  defaultColDef = this.constOtaService.defaultColDef;
  colDefs: ColDef[] = this.constOtaService.ORGANIZATION_UNITS_COL_DEFS_CHECKBOXES
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

  gridApi: GridApi<IOrganizationList>;

  organizations = [
    { name: 'Υπουργείο Εσωτερικών', code: 'YPI-001' },
    { name: 'Περιφέρεια Αττικής', code: 'PER-002' },
    { name: 'Δήμος Αθηναίων', code: 'DIM-003' }
  ];

  remitCompetences = [
    'Περιφέρειες',
    'Δήμοι',
    'Νησιωτικοί Δήμοι',
    'Ορεινοί Δήμοι',
    'Μητροπολιτικές Αρμοδιότητες'
  ];

  remitTypes = [
    'Επιτελική',
    'Εκτελεστική',
    'Υποστηρικτική',
    'Ελεγκτική',
    'Παρακολούθησης αποτελεσματικής πολιτικής και αξιολόγησης αποτελεσμάτων'
  ];

  form = new FormGroup({
    remitText: new FormControl('', Validators.required),
    remitCompetence: new FormControl('', Validators.required),
    remitType: new FormControl('', Validators.required),
    legalProvisions: new FormControl([], Validators.required),
    instructionProvisions: new FormControl([], Validators.required),
    publicPolicyAgency: new FormGroup({
      organization: new FormControl('', Validators.required),
      organizationCode: new FormControl('', Validators.required),
      organizationalUnit: new FormControl('', Validators.required),
      organizationalUnitCode: new FormControl('', Validators.required)
    })
  })

  // CRUD Methods
  onCreate() {
    // if (this.form.valid) {
      console.log('Create:', this.form.getRawValue());
      this.modalService.getUserConsent("sssss")
        .subscribe(result => {
          if (result) {
            console.log("yes")
          } else {
            console.log("no")
          }
        })
    // }
  }

  onUpdate() {
    console.log('Update:', this.form.getRawValue());
  }

  onDelete() {
    console.log('Delete current entry');
  }

  onClear() {
    this.form.reset();
  }

  get canAddLegalProvision() {
    return (
      this.form.get('remitCompetence').value &&
      this.form.get('remitType').value 
    );
  }
  
  newLegalProvision(): void {
    this.modalService.newLegalProvision().subscribe((data) => {
      if (data) {
        const tempLegalProvision = [{ ...data.legalProvision, isNew: true }, ...this.legalProvisions];
        this.legalProvisions = uniqWith(tempLegalProvision, (a, b) => {
          return a.legalActKey === b.legalActKey && isEqual(a.legalProvisionSpecs, b.legalProvisionSpecs);
        });
        this.form.get('legalProvisions').setValue(this.legalProvisions);
        this.updateRemitTextWithNewProvision(data.legalProvision.legalProvisionText);
      }
    });
  }

   newInstructionProvision(): void {
    this.modalService.newLegalProvision().subscribe((data) => {
      if (data) {
        const tempLegalProvision = [{ ...data.legalProvision, isNew: true }, ...this.instructionProvisions];
        this.instructionProvisions = uniqWith(tempLegalProvision, (a, b) => {
          return a.legalActKey === b.legalActKey && isEqual(a.legalProvisionSpecs, b.legalProvisionSpecs);
        });
        this.form.get('instructionProvisions').setValue(this.instructionProvisions);
        this.updateRemitTextWithNewProvision(data.legalProvision.legalProvisionText);
      }
    });
  }

  updateRemitTextWithNewProvision(newText: string) {
    const remitText = this.form.get('remitText').value;

    if (!(this.instructionProvisions.length === 1 && ('isNew' in this.instructionProvisions[0])) || !(this.legalProvisions.length === 1 && ('isNew' in this.legalProvisions[0])) ) {
      this.showInfoText = "<p style='color:red'>Στο πάνω μέρος του Κειμένου της αρμοδιότητας, εμφανίζεται το κείμενο της τελευταίας διάταξης που έχετε εισάγει. Στο κάτω μέρος εμφανίζεται το προγενέστερο κείμενο <strong>ως είχε πριν την εισαγωγή της τελευταίας διάταξης που έχετε εισάγει</strong>. Επεξεργαστείτε και κωδικοποιήστε το κείμενο της αρμοδιότητας όπως <strong>ισχύει ενιαία με την τελευταία τροποποιητική διάταξη</strong>.</p>";
    }
    // const updatedtext = `<p style="color:red"><strong>Ελέγξτε και τροποποιήστε το συνολικό κείμενο της Αρμοδιότητας μετά την τελευταία προσθήκη Διάταξης:</strong></p>${newText}${remitText}`;
    const updatedtext = `${newText}${remitText}`;

    this.form.get('remitText').setValue(updatedtext);
  }

  //  Grid Conf
  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.subscriptions.push(
      this.store.select(this.organizational_units$).subscribe((data) => {
        this.monades = data.map((org) => {
          return {
            ...org,
            organizationType: this.organizationUnitTypesMap.get(parseInt(String(org.unitType))),
            organization: this.organizationCodesMap.get(org.organizationCode),
            subOrganizationOf: this.organizationUnitCodesMap.get(org.supervisorUnitCode),
          };
        });
        this.gridApi.hideOverlay();
      }),
    )
  }

  onRowSelected(event: any) {
    const selectedNodes = event.api.getSelectedNodes();

    // Log selected rows to the console
    this.gridSelectedData = selectedNodes.map(node => node.data);
    console.log(this.gridSelectedData)
  }

  showData(code: string, unitType: string) {
    const result = this.gridData.filter((data) => {
      if (code === data.organizationCode && data.description === unitType)
        return data
    })

    if (result.length > 0)
      return result[0]['count']
    else
      return '-'
  }

  clearSelection() {
    if (this.gridApi) {
      this.gridApi.deselectAll(); // Clear all selected rows
      this.gridApi.setFilterModel(null);
    }
  }

  sanitizeHtml(html): SafeHtml {
    if (html) {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
      return ""
    }
  }
}
