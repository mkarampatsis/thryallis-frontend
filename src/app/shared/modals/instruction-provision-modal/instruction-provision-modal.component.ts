import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ConstOtaService } from 'src/app/shared/services/const-ota.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { take } from 'rxjs';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { IInstructionProvision } from '../../interfaces/instruction-provision/instruction-provision.interface';
import { IInstructionProvisionSpecs } from '../../interfaces/instruction-provision/instruction-provision-specs.interface';

@Component({
  selector: 'app-instruction-provision-modal',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
  templateUrl: './instruction-provision-modal.component.html',
  styleUrl: './instruction-provision-modal.component.css'
})
export class InstructionProvisionModalComponent {
  instructionProvision: IInstructionProvision | null = null;
  modalService = inject(ModalService);
  constOtaService = inject(ConstOtaService);

  modalRef: any;

  selectedInstructionActKey: string | undefined = undefined;

  editor: Editor = new Editor();
  toolbar: Toolbar = DEFAULT_TOOLBAR;

  form = new FormGroup(
    {
      instructionActText: new FormControl('', Validators.required),
      instructionPages: new FormGroup({
        from: new FormControl('', this.integerValidator),
        to: new FormControl('', this.integerValidator),
      }),
      instructionProvisionSpecs: new FormGroup({
        arthro: new FormControl(''),
        paragrafos: new FormControl(''),
        edafio: new FormControl(''),
      }),
      instructionActKey: new FormControl({ value: '', disabled: true }, Validators.required),
    },
    this.checkInstructionProvision,
  );

  ngOnInit(): void {
    if (this.instructionProvision) {
      this.selectedInstructionActKey = this.instructionProvision.instructionActKey;
      this.form.get('instructionActText')?.setValue(this.instructionProvision.instructionProvisionText);
      this.form.get('instructionProvisionSpecs')?.setValue(this.instructionProvision.instructionProvisionSpecs);
      this.form.get('instructionActKey')?.setValue(this.instructionProvision.instructionActKey);
      this.form.get('instructionPages')?.setValue(this.instructionProvision.instructionPages);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  checkInstructionProvision(form: FormGroup): { [key: string]: boolean } | null {
    if (
      form.get('instructionProvisionSpecs').get('arthro').value.trim() !== '' ||
      form.get('instructionProvisionSpecs').get('paragrafos').value.trim() !== '' ||
      form.get('instructionProvisionSpecs').get('edafio').value.trim() !== ''
    ) {
      return null;
    } else {
      return { emptyInstructionProvision: true };
    }
  }

  integerValidator(control: AbstractControl) {
    const value = control.value;

    if (value === null || value === '') return null; // optional field → OK

    return Number.isInteger(Number(value)) ? null : { notInteger: true };
  }

  selectInstructionAct() {
    this.modalService.selectInstructionAct().subscribe((data) => {
      // console.log(">>",data);
      this.selectedInstructionActKey = data;
      this.form.get('instructionActKey').setValue(data);
    });
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text');
    console.log('Pasting...', text);
    this.form.get('instructionActText').setValue(text);
  }

  onSubmit() {
    // console.log(this.form.value);
    const instructionProvisionSpecs = this.form.get('instructionProvisionSpecs').value as IInstructionProvisionSpecs;
    const instructionActKey = this.form.get('instructionActKey').value;
    const instructionProvisionText = this.form.get('instructionActText').value;
    const instructionPages = this.form.get('instructionPages').value;
    
    const instructionProvision = {
      instructionProvisionSpecs,
      instructionActKey,
      instructionProvisionText,
      instructionPages
    } as IInstructionProvision;
    this.modalRef.dismiss({ instructionProvision });
  }

  dismiss() {
    if (this.form.dirty) {
      this.modalService
        .getUserConsent(
          `Αν κλείσετε το παράθυρο οι αλλαγές στην εγκύκλια οδηγίας δεν θα αποθηκευτούν! Παρακαλούμε επιβεβαιώστε την ενέργεια.`,
        )
        .pipe(take(1))
        .subscribe((consent) => {
          if (consent) {
            this.modalRef.dismiss();
          }
        });
    } else {
      this.modalRef.dismiss();
    }
  }

}
