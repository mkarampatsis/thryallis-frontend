import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-ota-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ota-edit.component.html',
  styleUrl: './ota-edit.component.css'
})
export class OtaEditComponent{
  otaForm!: FormGroup;

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
    remitContent: new FormControl('', Validators.required),
    organization: new FormControl('', Validators.required),
    organizationCode: new FormControl('', Validators.required),
    remitType: new FormGroup({
      remitContent: new FormControl('', Validators.required),
      organizationRemitCompetence: new FormControl('', Validators.required),
      remitType: new FormControl('', Validators.required),
      legalProvision: new FormControl('', Validators.required)
    }),
    legalProvision: new FormControl('', Validators.required),
    circularInstructions: new FormControl('', Validators.required),
    publicPolicyAgency: new FormGroup({
      organization: new FormControl('', Validators.required),
      organizationCode: new FormControl('', Validators.required),
      organizationalUnit: new FormControl('', Validators.required),
      organizationalUnitCode: new FormControl('', Validators.required)
    })
  })

  // CRUD Methods
  onCreate() {
    if (this.otaForm.valid) {
      console.log('Create:', this.otaForm.getRawValue());
    }
  }

  onUpdate() {
    console.log('Update:', this.otaForm.getRawValue());
  }

  onDelete() {
    console.log('Delete current entry');
  }

  onClear() {
    this.otaForm.reset();
  }
}
