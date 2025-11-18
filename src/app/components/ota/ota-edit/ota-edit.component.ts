import { Component, inject } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ListLegalProvisionsComponent } from 'src/app/shared/components/list-legal-provisions/list-legal-provisions.component';

import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { isEqual, uniqWith } from 'lodash-es';
import { Subscription } from 'rxjs';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { IOta } from 'src/app/shared/interfaces/ota/ota.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Component({
  selector: 'app-ota-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule],
  templateUrl: './ota-edit.component.html',
  styleUrl: './ota-edit.component.css'
})
export class OtaEditComponent{
  modalService = inject(ModalService);
  
  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;
  sanitizer = inject(DomSanitizer);

  legalProvisions: ILegalProvision[] = [];
  instructionProvisions: ILegalProvision[] = [];
  showInfoText: string = '';

  ota: IOta = null;

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
    // this.modalService.newLegalProvision().subscribe((data) => {
    //   if (data) {
    //     const tempLegalProvision = [{ ...data.legalProvision, isNew: true }, ...this.legalProvisions];
    //     this.legalProvisions = uniqWith(tempLegalProvision, (a, b) => {
    //       return a.legalActKey === b.legalActKey && isEqual(a.legalProvisionSpecs, b.legalProvisionSpecs);
    //     });
    //     this.form.get('legalProvisions').setValue(this.legalProvisions);
    //     this.updateRemitTextWithNewProvision(data.legalProvision.legalProvisionText);
    //   }
    // });
  }

   newInstructionProvision(): void {
    // this.modalService.newLegalProvision().subscribe((data) => {
    //   if (data) {
    //     const tempLegalProvision = [{ ...data.legalProvision, isNew: true }, ...this.instructionProvisions];
    //     this.instructionProvisions = uniqWith(tempLegalProvision, (a, b) => {
    //       return a.legalActKey === b.legalActKey && isEqual(a.legalProvisionSpecs, b.legalProvisionSpecs);
    //     });
    //     this.form.get('instructionProvisions').setValue(this.instructionProvisions);
    //     this.updateRemitTextWithNewProvision(data.legalProvision.legalProvisionText);
    //   }
    // });
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
}
