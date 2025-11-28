import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IFek } from 'src/app/shared/interfaces/legal-act/fek.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { InstructionActService } from 'src/app/shared/services/instruction-act.service';
import { IInstructionAct } from '../../interfaces/instruction-act/instruction-act.interface';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import moment from 'moment';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-instruction-act-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbAlertModule, NgbTooltipModule],
  templateUrl: './instruction-act-modal.component.html',
  styleUrl: './instruction-act-modal.component.css'
})
export class InstructionActModalComponent {
  // instructionAct value is passed from modalService when the edit button is clicked, else it is null, so we can create a new legal act
  instructionAct: IInstructionAct = null;
  // Some useful services
  constService = inject(ConstService);
  utilService = inject(UtilService);
  uploadService = inject(FileUploadService);
  organizationUnitService = inject(OrganizationalUnitService);
  instructionActService = inject(InstructionActService);

  modalRef: any;

  years: number[] = [];
  currentYear: number = new Date().getFullYear();

  progress = 0;
  currentFile: File;
  uploadObjectID: string | null = null;

  fek: IFek;
  fekYear: string = null;

  moreThan30 = false;

  actTypes = this.constService.ACT_TYPES;

  form = new FormGroup({
    instructionActType: new FormControl(null, Validators.required),
    instructionActTypeOther: new FormControl(null),
    instructionActNumber: new FormControl(null, Validators.required),
    instructionActDateOrYear: new FormControl(null, Validators.required),
    fek: new FormGroup({
      // number: new FormControl(null),
      // issue: new FormControl(null),
      date: new FormControl(null),
    }),
    ada: new FormControl(null, Validators.pattern(/^[Α-Ω,0-9]{10}-[Α-Ω,0-9]{3}$/)),
    instructionActFile: new FormControl(null, Validators.required),
  });

  formSubscriptions: Subscription[] = [];
  showOtherInstructionActType = false;

  ngOnInit(): void {
    if (this.instructionAct) {
      // If we are editing an existing legal act, we need to populate the form with the existing data
      this.form.controls.instructionActType.setValue(this.instructionAct.instructionActType);
      this.form.controls.instructionActTypeOther.setValue(this.instructionAct.instructionActTypeOther);
      this.form.controls.instructionActNumber.setValue(this.instructionAct.instructionActNumber);
      this.form.controls.instructionActDateOrYear.setValue(this.instructionAct.instructionActDateOrYear);
      if (this.instructionAct.ada.startsWith('ΜΗ ΑΝΑΡΤΗΤΕΑ ΠΡΑΞΗ')) {
        this.form.controls.ada.setValue(null);
      } else {
        this.form.controls.ada.setValue(this.instructionAct.ada);
      }
      this.form.controls.instructionActFile.setValue(this.instructionAct.instructionActFile);
      if (this.instructionAct.fek.number.startsWith('ΜΗ ΔΗΜΟΣΙΕΥΤΕΑ ΠΡΑΞΗ')) {
        this.form.controls.fek.setValue({
          // number: null,
          // issue: null,
          date: null,
        });
      } else {
        this.form.controls.fek.setValue({
          // number: this.instructionAct.fek?.number,
          // issue: this.instructionAct.fek?.issue,
          date: this.instructionAct.fek?.date,
        });
        const date = moment(this.instructionAct.fek.date, 'YYYY-MM-DD', true);
        this.fekYear = date.isValid() ? date.year().toString() : null;
      }
      // Mark the form as pristine, so the submit button is disabled until the user makes a change
      this.form.markAsPristine();
      // If the legal act type is 'ΑΛΛΟ', we need to show the input field for the other legal act type
      this.instructionActTypeOtherHandler();
    }

    // Create an array of years from 1864 (first Greek Constitution) to the current year
    for (let i = this.currentYear; i >= 1864; i--) {
      this.years.push(i);
    }

    // Subscribe to value changes in the form fields that are crucial for the form validation

    this.formSubscriptions.push(
      this.form.get('instructionActType').valueChanges.subscribe((value) => {
        this.form.controls.instructionActDateOrYear.setValue('');
        this.form.controls.instructionActDateOrYear.updateValueAndValidity();
        this.instructionActTypeOtherHandler();
      }),
    );

    // this.formSubscriptions.push(
    //   this.form.get('fek.number').valueChanges.subscribe((value: string) => {
    //     if (value && value.trim() === '' && value.length > 0) {
    //       this.form.controls.fek.controls.number.setErrors({ empty: true });
    //     }
    //   }),
    // );

    this.formSubscriptions.push(
      this.form.get('instructionActDateOrYear').valueChanges.subscribe((value) => {
        if (value) {
          if (!this.emptyFEK()) {
            this.moreThan30 = this.moreThan30DaysDifference();
          } else {
            this.moreThan30 = false;
          }
        }
      }),
    );

    this.formSubscriptions.push(
      this.form.get('fek').valueChanges.subscribe((value) => {
        const date = moment(value.date, 'YYYY-MM-DD', true);
        if (date.isValid()) {
          const year = date.year().toString();
          const instructionActType = this.form.get('instructionActType').value;
          if (instructionActType && ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(instructionActType) && !this.emptyFEK()) {
            this.form.controls.instructionActDateOrYear.setValue(year.toString());
            this.form.controls.instructionActDateOrYear.updateValueAndValidity();
            this.fekYear = year;
          } else {
            if (this.form.get('instructionActDateOrYear').value) {
              this.moreThan30 = this.moreThan30DaysDifference();
            }
          }
        }
      }),
    );
  }

  instructionActTypeOtherHandler() {
    const value = this.form.get('instructionActType').value;
    if (value === 'ΑΛΛΟ') {
      this.showOtherInstructionActType = true;
      this.form.controls.instructionActTypeOther.setValidators(Validators.required);
      this.form.controls.instructionActTypeOther.updateValueAndValidity();
    } else {
      this.form.controls.instructionActTypeOther.setValue('');
      this.form.controls.instructionActTypeOther.clearValidators();
      this.form.controls.instructionActTypeOther.updateValueAndValidity();
      this.showOtherInstructionActType = false;
    }
  }

  moreThan30DaysDifference(): boolean {
    const instructionActType = this.form.get('instructionActType').value;
    if (instructionActType && !['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(instructionActType)) {
      const fekDate = moment(this.form.get('fek.date').value, 'YYYY-MM-DD', true);
      const instructionActDate = moment(this.form.get('instructionActDateOrYear').value, 'YYYY-MM-DD', true);
      const diffDays = Math.abs(instructionActDate.diff(fekDate, 'days'));
      console.log('Days difference', diffDays);
      return diffDays > 30;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.formSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  onSubmit() {
    let data = {
      ...this.form.value,
    } as IInstructionAct;

    if (data.ada === '') data.ada = null;
    if (data.fek.number === '') data.fek.number = null;

    if (this.instructionAct === null) {
      console.log('Will create new instruction act using data: ', data);
      this.instructionActService.newInstructionAct(data).subscribe((data) => {
        console.log('Data', data);
        this.modalRef.dismiss(true);
      });
    } else {
      console.log('Will update instruction act using data: ', data);
      const id = this.instructionAct._id.$oid;
      this.instructionActService.updateInstructionAct(id, data).subscribe((data) => {
        console.log('Data', data);
        this.modalRef.dismiss(data);
      });
    }
  }

  selectFile(event: any): void {
    if (event.target.files.length === 0) {
      console.log('No file selected!');
      return;
    }
    this.currentFile = event.target.files[0];
    this.uploadService.upload(this.currentFile).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event instanceof HttpResponse) {
          this.uploadObjectID = event.body.id;
          this.form.controls.instructionActFile.setValue(this.uploadObjectID);
          this.form.markAsDirty();
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('Upload complete');
      },
    });
  }

  emptyADA() {
    const ada = this.form.get('ada').value;
    return ada === null || ada.trim() === '';
  }

  emptyFEK() {
    return (
      // this.form.get('fek.number').value === null ||
      // this.form.get('fek.issue').value === null ||
      this.form.get('fek.date').value === null ||
      // this.form.get('fek.number').value.trim() === '' ||
      // this.form.get('fek.issue').value === '' ||
      this.form.get('fek.date').value === ''
    );
  }

  getOrganizationPrefferedLabelByCode(code: string): string | undefined {
    return this.constService.ORGANIZATION_CODES.find((x) => x.code === code)?.preferredLabel;
  }

  hideInstructionActDateOrYear(): boolean {
    return this.form.controls.instructionActType.value === null;
  }

  actNeedsOnlyYear(): boolean {
    const instructionType = this.form.controls.instructionActType.value;
    return ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(instructionType);
  }

  formValid(): boolean {
    const instructionActType = this.form.get('instructionActType').value;
    if (instructionActType && ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(instructionActType)) {
      if (this.emptyFEK()) {
        return this.form.valid;
      } else {
        console.log('>>>>>>>>>>>>', this.form.valid, this.fekYear, this.form.get('instructionActDateOrYear').value);
        return this.form.valid && this.fekYear === this.form.get('instructionActDateOrYear').value;
      }
    } else {
      return this.form.valid;
    }
  }

  fekDateVSActDateInvalid(): boolean {
    const instructionActType = this.form.get('instructionActType').value;
    if (instructionActType && !['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(instructionActType)) {
      return false;
    } else {
      return !this.emptyFEK() && this.fekYear !== this.form.get('instructionActDateOrYear').value;
    }
  }

  hasUploadedFile(): boolean {
    return this.form.get('instructionActFile').value !== null;
  }
}
