import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { ILegalProvision } from '../../interfaces/legal-provision/legal-provision.interface';
import { ILegalProvisionSpecs } from '../../interfaces/legal-provision/legal-provision-specs.interface';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { IReguLatedObject } from '../../interfaces/legal-provision/regulated-object.interface';
import { take } from 'rxjs';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep, isEqual, uniqWith } from 'lodash-es';

@Component({
    selector: 'app-new-legal-provision',
    standalone: true,
    imports: [ReactiveFormsModule, NgxEditorModule, NgbAlertModule],
    templateUrl: './legal-provision-modal.component.html',
    styleUrl: './legal-provision-modal.component.css',
})
export class LegalProvisionModalComponent implements OnInit, OnDestroy {
    legalProvision: ILegalProvision | null = null;
    // Some useful services
    modalService = inject(ModalService);
    constService = inject(ConstService);
    // legalProvisionService = inject(LegalProvisionService);

    modalRef: any;

    selectedLegalActKey: string | undefined = undefined;

    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;

    form = new FormGroup(
        {
            legalActText: new FormControl('', Validators.required),
            legalProvisionSpecs: new FormGroup({
                meros: new FormControl(''),
                arthro: new FormControl(''),
                paragrafos: new FormControl(''),
                edafio: new FormControl(''),
                pararthma: new FormControl(''),
            }),
            legalActKey: new FormControl({ value: '', disabled: true }, Validators.required),
        },
        this.checkLegalProvision,
    );

    ngOnInit(): void {
        if (this.legalProvision) {
            this.selectedLegalActKey = this.legalProvision.legalActKey;
            this.form.get('legalActText').setValue(this.legalProvision.legalProvisionText);
            this.form.get('legalProvisionSpecs').setValue(this.legalProvision.legalProvisionSpecs);
            this.form.get('legalActKey').setValue(this.legalProvision.legalActKey);
        }
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    checkLegalProvision(form: FormGroup): { [key: string]: boolean } | null {
        if (
            form.get('legalProvisionSpecs').get('meros').value.trim() !== '' ||
            form.get('legalProvisionSpecs').get('arthro').value.trim() !== '' ||
            form.get('legalProvisionSpecs').get('paragrafos').value.trim() !== '' ||
            form.get('legalProvisionSpecs').get('edafio').value.trim() !== '' ||
            form.get('legalProvisionSpecs').get('pararthma').value.trim() !== ''
        ) {
            return null;
        } else {
            return { emptyLegalProvision: true };
        }
    }

    selectLegalAct() {
        this.modalService.selectLegalAct().subscribe((data) => {
            // console.log(data);
            this.selectedLegalActKey = data;
            this.form.get('legalActKey').setValue(data);
        });
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const text = event.clipboardData?.getData('text');
        console.log('Pasting...', text);
        this.form.get('legalActText').setValue(text);
    }

    onSubmit() {
        // console.log(this.form.value);
        const legalProvisionSpecs = this.form.get('legalProvisionSpecs').value as ILegalProvisionSpecs;

        const legalActKey = this.form.get('legalActKey').value;
        const legalProvisionText = this.form.get('legalActText').value;
        const legalProvision = {
            legalProvisionSpecs,
            legalActKey,
            legalProvisionText,
        } as ILegalProvision;
        // this.legalProvisionService.newLegalProvision(legalProvision).subscribe((data) => {
        //     const { message, legalProvision } = data;
        //     console.log(message);
        //     this.modalRef.dismiss({ legalProvision });
        // });
        this.modalRef.dismiss({ legalProvision });
    }

    dismiss() {
        if (this.form.dirty) {
            this.modalService
                .getUserConsent(
                    `Αν κλείσετε το παράθυρο οι αλλαγές στη διάταξη δεν θα αποθηκευτούν! Παρακαλούμε επιβεβαιώστε την ενέργεια.`,
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
