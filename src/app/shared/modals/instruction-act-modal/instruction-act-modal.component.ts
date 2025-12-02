import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ConstService } from 'src/app/shared/services/const.service';
import { ConstOtaService } from '../../services/const-ota.service';
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
  constOtaService = inject(ConstOtaService);
  utilService = inject(UtilService);
  uploadService = inject(FileUploadService);
  organizationUnitService = inject(OrganizationalUnitService);
  instructionActService = inject(InstructionActService);

  modalRef: any;

  progress = 0;
  currentFile: File;
  uploadObjectID: string | null = null;

  instructionTypes = this.constOtaService.INSTRUCTION_TYPES;

  form = new FormGroup({
    instructionActType: new FormControl(null, Validators.required),
    instructionActNumber: new FormControl(null, Validators.required),
    instructionActDate: new FormControl(null, Validators.required),
    ada: new FormControl(null, Validators.pattern(/^[Α-Ω,0-9]{10}-[Α-Ω,0-9]{3}$/)),
    instructionActFile: new FormControl(null, Validators.required),
  });

  ngOnInit(): void {
    console.log('InstructionActModalComponent initialized with instructionAct: ', this.instructionAct);
    if (this.instructionAct) {
      // If we are editing an existing legal act, we need to populate the form with the existing data
      this.form.controls.instructionActType.setValue(this.instructionAct.instructionActType);
      this.form.controls.instructionActNumber.setValue(this.instructionAct.instructionActNumber);
      this.form.controls.instructionActDate.setValue(this.instructionAct.instructionActDate);
      if (this.instructionAct.ada.startsWith('ΜΗ ΑΝΑΡΤΗΤΕΑ ΠΡΑΞΗ')) {
        this.form.controls.ada.setValue(null);
      } else {
        this.form.controls.ada.setValue(this.instructionAct.ada);
      }
      this.form.controls.instructionActFile.setValue(this.instructionAct.instructionActFile);
      
      // Mark the form as pristine, so the submit button is disabled until the user makes a change
      this.form.markAsPristine();
      // If the legal act type is 'ΑΛΛΟ', we need to show the input field for the other legal act type
    }
  }

  onSubmit() {

    // const invalid = [];
    // const controls = this.form.controls;
    // for (const name in controls) {
    //   if (controls[name].invalid) {
    //     invalid.push(name);
    //   }
    // }
    // console.log(invalid)

    let data = {
      ...this.form.value,
    } as IInstructionAct;

    if (data.ada === '') data.ada = null;

    if (this.instructionAct === null) {
      console.log('Will create new instruction act using data: ', data);
      this.instructionActService.newInstructionAct(data)
        .subscribe((data) => {
          console.log('Data', data);
          this.modalRef.dismiss(true);
        });
    } else {
      console.log('Will update instruction act using data: ', data);
      const id = this.instructionAct._id.$oid;
      this.instructionActService.updateInstructionAct(id, data)
        .subscribe((data) => {
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

  hasUploadedFile(): boolean {
    return this.form.get('instructionActFile').value !== null;
  }
}
