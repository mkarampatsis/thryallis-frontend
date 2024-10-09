import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IFek } from 'src/app/shared/interfaces/legal-act/fek.interface';
import { ConstService } from 'src/app/shared/services/const.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { ILegalAct } from 'src/app/shared/interfaces/legal-act/legal-act.interface';
import { LegalActService } from 'src/app/shared/services/legal-act.service';
import moment from 'moment';
import { UtilService } from '../../services/util.service';

@Component({
    selector: 'app-new-legal-act',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgbAlertModule, NgbTooltipModule],
    templateUrl: './legal-act-modal.component.html',
    styleUrl: './legal-act-modal.component.css',
})
export class LegalActModalComponent implements OnInit {
    // legalAct value is passed from modalService when the edit button is clicked, else it is null, so we can create a new legal act
    legalAct: ILegalAct = null;
    // Some useful services
    constService = inject(ConstService);
    utilService = inject(UtilService);
    uploadService = inject(FileUploadService);
    organizationUnitService = inject(OrganizationalUnitService);
    legalActService = inject(LegalActService);

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
        legalActType: new FormControl(null, Validators.required),
        legalActTypeOther: new FormControl(null),
        legalActNumber: new FormControl(null, Validators.required),
        legalActDateOrYear: new FormControl(null, Validators.required),
        fek: new FormGroup({
            number: new FormControl(null),
            issue: new FormControl(null),
            date: new FormControl(null),
        }),
        ada: new FormControl(null, Validators.pattern(/^[Α-Ω,0-9]{10}-[Α-Ω,0-9]{3}$/)),
        legalActFile: new FormControl(null, Validators.required),
    });

    formSubscriptions: Subscription[] = [];
    showOtherLegalActType = false;

    ngOnInit(): void {
        if (this.legalAct) {
            // If we are editing an existing legal act, we need to populate the form with the existing data
            this.form.controls.legalActType.setValue(this.legalAct.legalActType);
            this.form.controls.legalActTypeOther.setValue(this.legalAct.legalActTypeOther);
            this.form.controls.legalActNumber.setValue(this.legalAct.legalActNumber);
            this.form.controls.legalActDateOrYear.setValue(this.legalAct.legalActDateOrYear);
            if (this.legalAct.ada.startsWith('ΜΗ ΑΝΑΡΤΗΤΕΑ ΠΡΑΞΗ')) {
                this.form.controls.ada.setValue(null);
            } else {
                this.form.controls.ada.setValue(this.legalAct.ada);
            }
            this.form.controls.legalActFile.setValue(this.legalAct.legalActFile);
            if (this.legalAct.fek.number.startsWith('ΜΗ ΔΗΜΟΣΙΕΥΤΕΑ ΠΡΑΞΗ')) {
                this.form.controls.fek.setValue({
                    number: null,
                    issue: null,
                    date: null,
                });
            } else {
                this.form.controls.fek.setValue({
                    number: this.legalAct.fek?.number,
                    issue: this.legalAct.fek?.issue,
                    date: this.legalAct.fek?.date,
                });
                const date = moment(this.legalAct.fek.date, 'YYYY-MM-DD', true);
                this.fekYear = date.isValid() ? date.year().toString() : null;
            }
            // Mark the form as pristine, so the submit button is disabled until the user makes a change
            this.form.markAsPristine();
            // If the legal act type is 'ΑΛΛΟ', we need to show the input field for the other legal act type
            this.legalActTypeOtherHandler();
        }

        // Create an array of years from 1864 (first Greek Constitution) to the current year
        for (let i = this.currentYear; i >= 1864; i--) {
            this.years.push(i);
        }

        // Subscribe to value changes in the form fields that are crucial for the form validation

        this.formSubscriptions.push(
            this.form.get('legalActType').valueChanges.subscribe((value) => {
                this.form.controls.legalActDateOrYear.setValue('');
                this.form.controls.legalActDateOrYear.updateValueAndValidity();
                // if (value === 'ΑΛΛΟ') {
                //     this.showOtherLegalActType = true;
                //     this.form.controls.legalActTypeOther.setValidators(Validators.required);
                //     this.form.controls.legalActTypeOther.updateValueAndValidity();
                // } else {
                //     this.form.controls.legalActTypeOther.setValue('');
                //     this.form.controls.legalActTypeOther.clearValidators();
                //     this.form.controls.legalActTypeOther.updateValueAndValidity();
                //     this.showOtherLegalActType = false;
                // }
                this.legalActTypeOtherHandler();
            }),
        );

        this.formSubscriptions.push(
            this.form.get('fek.number').valueChanges.subscribe((value: string) => {
                if (value && value.trim() === '' && value.length > 0) {
                    this.form.controls.fek.controls.number.setErrors({ empty: true });
                }
            }),
        );

        this.formSubscriptions.push(
            this.form.get('legalActDateOrYear').valueChanges.subscribe((value) => {
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
                    const legalActType = this.form.get('legalActType').value;
                    if (legalActType && ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalActType) && !this.emptyFEK()) {
                        this.form.controls.legalActDateOrYear.setValue(year.toString());
                        this.form.controls.legalActDateOrYear.updateValueAndValidity();
                        this.fekYear = year;
                    } else {
                        if (this.form.get('legalActDateOrYear').value) {
                            this.moreThan30 = this.moreThan30DaysDifference();
                        }
                    }
                }
            }),
        );
    }

    legalActTypeOtherHandler() {
        const value = this.form.get('legalActType').value;
        if (value === 'ΑΛΛΟ') {
            this.showOtherLegalActType = true;
            this.form.controls.legalActTypeOther.setValidators(Validators.required);
            this.form.controls.legalActTypeOther.updateValueAndValidity();
        } else {
            this.form.controls.legalActTypeOther.setValue('');
            this.form.controls.legalActTypeOther.clearValidators();
            this.form.controls.legalActTypeOther.updateValueAndValidity();
            this.showOtherLegalActType = false;
        }
    }

    moreThan30DaysDifference(): boolean {
        const legalActType = this.form.get('legalActType').value;
        if (legalActType && !['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalActType)) {
            const fekDate = moment(this.form.get('fek.date').value, 'YYYY-MM-DD', true);
            const legalActDate = moment(this.form.get('legalActDateOrYear').value, 'YYYY-MM-DD', true);
            const diffDays = Math.abs(legalActDate.diff(fekDate, 'days'));
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
        } as ILegalAct;

        if (data.ada === '') data.ada = null;
        if (data.fek.number === '') data.fek.number = null;

        if (this.legalAct === null) {
            console.log('Will create new legal act using data: ', data);
            this.legalActService.newLegalAct(data).subscribe((data) => {
                console.log('Data', data);
                this.modalRef.dismiss(true);
            });
        } else {
            console.log('Will update legal act using data: ', data);
            const id = this.legalAct._id.$oid;
            this.legalActService.updateLegalAct(id, data).subscribe((data) => {
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
                    this.form.controls.legalActFile.setValue(this.uploadObjectID);
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
            this.form.get('fek.number').value === null ||
            this.form.get('fek.issue').value === null ||
            this.form.get('fek.date').value === null ||
            this.form.get('fek.number').value.trim() === '' ||
            this.form.get('fek.issue').value === '' ||
            this.form.get('fek.date').value === ''
        );
    }

    getOrganizationPrefferedLabelByCode(code: string): string | undefined {
        return this.constService.ORGANIZATION_CODES.find((x) => x.code === code)?.preferredLabel;
    }

    hideLegalActDateOrYear(): boolean {
        return this.form.controls.legalActType.value === null;
    }

    actNeedsOnlyYear(): boolean {
        const legalType = this.form.controls.legalActType.value;
        return ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalType);
    }

    formValid(): boolean {
        const legalActType = this.form.get('legalActType').value;
        if (legalActType && ['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalActType)) {
            if (this.emptyFEK()) {
                return this.form.valid;
            } else {
                console.log('>>>>>>>>>>>>', this.form.valid, this.fekYear, this.form.get('legalActDateOrYear').value);
                return this.form.valid && this.fekYear === this.form.get('legalActDateOrYear').value;
            }
        } else {
            return this.form.valid;
        }
    }

    fekDateVSActDateInvalid(): boolean {
        const legalActType = this.form.get('legalActType').value;
        if (legalActType && !['ΝΟΜΟΣ', 'ΠΡΟΕΔΡΙΚΟ ΔΙΑΤΑΓΜΑ'].includes(legalActType)) {
            return false;
        } else {
            return !this.emptyFEK() && this.fekYear !== this.form.get('legalActDateOrYear').value;
        }
    }

    hasUploadedFile(): boolean {
        return this.form.get('legalActFile').value !== null;
    }
}
