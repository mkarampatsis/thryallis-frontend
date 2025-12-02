import { Component, inject, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { OtaService } from '../../services/ota.service';

import { ListLegalProvisionsComponent } from 'src/app/shared/components/list-legal-provisions/list-legal-provisions.component';
import { ListInstructionProvisionsComponent } from '../../components/list-instruction-provisions/list-instruction-provisions.component';

import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { isEqual, uniqWith } from 'lodash-es';
import { Subscription, take } from 'rxjs';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { IOta } from 'src/app/shared/interfaces/ota/ota.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { GridLoadingOverlayComponent } from 'src/app/shared/modals/grid-loading-overlay/grid-loading-overlay.component';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';

import { AppState } from 'src/app/shared/state/app.state';
import { Store } from '@ngrx/store';
import { selectOrganizations$ } from 'src/app/shared/state/organizations.state';

import { IInstructionProvision } from '../../interfaces/instruction-provision/instruction-provision.interface';
import { ICofog2 } from '../../interfaces/cofog/cofog2.interface';
import { ICofog3 } from '../../interfaces/cofog/cofog3.interface';

@Component({
  selector: 'app-ota-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    NgxEditorModule, 
    ListLegalProvisionsComponent,
    ListInstructionProvisionsComponent, 
    AgGridAngular
  ],
  templateUrl: './ota-edit.component.html',
  styleUrl: './ota-edit.component.css'
})
export class OtaEditComponent implements OnInit {
  modalService = inject(ModalService);
  constOtaService = inject(ConstOtaService);
  otaService = inject(OtaService);

  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;
  sanitizer = inject(DomSanitizer);

  legalProvisions: ILegalProvision[] = [];
  instructionProvisions: IInstructionProvision[] = [];

  cofog1 = this.constOtaService.COFOG;
  cofog2: ICofog2[] = [];
  cofog3: ICofog3[] = [];
  cofog1_selected: boolean = false;
  cofog2_selected: boolean = false;
  
  showInfoText: string = '';

  data: IOta = null;
  readOnly: boolean = false;
  updateMode: boolean = false;
  modalRef: any;

  ota: IOta = null;
  foreis: IOrganizationList[] = [];

  gridSelectedData = [];
  gridData = [];

  store = inject(Store<AppState>);
  organizations$ = selectOrganizations$;

  organizationCodesMap = this.constOtaService.ORGANIZATION_CODES_MAP;
  organizationTypesMap = this.constOtaService.ORGANIZATION_TYPES_MAP;

  defaultColDef = this.constOtaService.defaultColDef;
  colDefs: ColDef[] = this.constOtaService.OTA_COL_DEFS;
  autoSizeStrategy = this.constOtaService.autoSizeStrategy;

  loadingOverlayComponent = GridLoadingOverlayComponent;
  loadingOverlayComponentParams = { loadingMessage: 'Αναζήτηση στοιχείων...' };

  gridApi: GridApi<IOrganizationList>;

  remitCompetences = [
    'Περιφέρειες',
    'Δήμοι',
    'Νησιωτικοί Δήμοι',
    'Ορεινοί Δήμοι',
    // 'Μητροπολιτικές Αρμοδιότητες'
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
    cofog1: new FormControl('', Validators.required),
    cofog1_name: new FormControl(''),
    cofog2: new FormControl('', Validators.required),
    cofog2_name: new FormControl(''),
    cofog3: new FormControl('', Validators.required),
    cofog3_name: new FormControl(''),
    legalProvisions: new FormControl([], Validators.required),
    instructionProvisions: new FormControl([], Validators.required),
    publicPolicyAgency: new FormGroup({
      organization: new FormControl('', Validators.required),
      organizationCode: new FormControl('', Validators.required),
      organizationType: new FormControl('', Validators.required),
​​      status:  new FormControl('', Validators.required),
      subOrganizationOf: new FormControl('', Validators.required),​
      subOrganizationOfCode: new FormControl('', Validators.required),
    }),
    remitLocalOrGlobal: new FormControl('', Validators.required),
  });
  formSubscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.formSubscriptions.push(
      this.form.get('cofog1').valueChanges.subscribe((value) => {
        if (value) {
          this.form.get('cofog2').setValue('');
          this.cofog1_selected = true;
          this.cofog2_selected = false;
          this.cofog2 = this.constOtaService.COFOG.find((cofog) => cofog.code === value)?.cofog2 || [];
        }
      }),
    );

    this.formSubscriptions.push(
      this.form.get('cofog2').valueChanges.subscribe((value) => {
        if (value) {
          this.form.get('cofog3').setValue('');
          this.cofog2_selected = true;
          this.cofog3 = this.cofog2.find((cofog) => cofog.code === value)?.cofog3 || [];
        }
      }),
    );
  }
  // CRUD Methods
  onCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const otaData = this.form.getRawValue() as unknown as IOta;
    if (this.form.valid) {
      
      const cofogNames = this.constOtaService.getCofogNames(
        this.form.controls.cofog1.value,
        this.form.controls.cofog2.value,
        this.form.controls.cofog3.value
      );  
      this.form.controls.cofog1_name.setValue(cofogNames[0]);
      this.form.controls.cofog2_name.setValue(cofogNames[1]);
      this.form.controls.cofog3_name.setValue(cofogNames[2]);

      if (!this.updateMode){
        this.otaService.newOta(otaData)
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 201) {
            this.resetForm();
            this.modalRef.close(true);
          }
        })
      } else {
        this.otaService.updateOta(otaData, this.ota._id)
        .subscribe(response => {
          const body = response.body;          
          const status = response.status;        
          if (status === 201) {
            this.modalRef.close(true);
            this.resetForm();
          }
        })
      }
    }
  }

  resetForm() {
    this.form.reset();
  }

  // get canAddLegalProvision() {
  //   return (
  //     this.form.get('remitCompetence').value &&
  //     this.form.get('remitType').value 
  //   );
  // }

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
    this.modalService.newInstructionProvision().subscribe((data) => {
      if (data) {
        const tempProvision = [{ ...data.instructionProvision, isNew: true }, ...this.instructionProvisions];
        this.instructionProvisions = uniqWith(tempProvision, (a, b) => {
          return a.instructionActKey === b.instructionActKey && isEqual(a.instructionProvisionSpecs, b.instructionProvisionSpecs);
        });
        this.form.get('instructionProvisions').setValue(this.instructionProvisions);
        this.updateRemitTextWithNewProvision(data.instructionProvision.instructionProvisionText);
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

  sanitizeHtml(html): SafeHtml {
    if (html) {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } else {
      return ""
    }
  }

  onGridReady(params: GridReadyEvent<IOrganizationList>): void {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
    this.store
      .select(selectOrganizations$)
      .pipe(take(1))
      .subscribe((data) => {
        this.foreis = data.map((org) => {
          return {
            ...org,
            organizationType: this.organizationTypesMap.get(parseInt(String(org.organizationType))),
            subOrganizationOf: this.organizationCodesMap.get(org.subOrganizationOf),
            subOrganizationOfCode: org.subOrganizationOf
          };
        });
        this.gridApi.hideOverlay();
      });    
  }

  onRowSelected(event: any) {
    const selectedNodes = event.api.getSelectedNodes();
    
    this.gridSelectedData = selectedNodes.map(node => node.data);
    this.form.controls.publicPolicyAgency.setValue({
      organization: this.gridSelectedData[0].preferredLabel,
      organizationCode: this.gridSelectedData[0].code,
      organizationType: this.gridSelectedData[0].organizationType,
​​      status: this.gridSelectedData[0].status,
      subOrganizationOf: this.gridSelectedData[0].subOrganizationOf,
      subOrganizationOfCode: this.gridSelectedData[0].subOrganizationOfCode
    });
  }

  clearSelection() {
    if (this.gridApi) {
      this.gridApi.deselectAll(); // Clear all selected rows
      this.gridApi.setFilterModel(null);
    }
  }
}
