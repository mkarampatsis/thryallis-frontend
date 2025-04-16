import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstService } from '../../services/const.service';
import { ModalService } from '../../services/modal.service';
import { LegalProvisionService } from '../../services/legal-provision.service';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { IMonada } from '../../interfaces/monada/monada.interface';
import { IOrganizationUnit } from '../../interfaces/organization-unit';
import { ILegalProvision } from '../../interfaces/legal-provision/legal-provision.interface';
import { cloneDeep, isEqual, uniqWith } from 'lodash-es';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ListLegalProvisionsComponent } from '../../components/list-legal-provisions/list-legal-provisions.component';
import { MonadesService } from '../../services/monades.service';
import { OrganizationalUnitService } from '../../services/organizational-unit.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-monada-edit',
    standalone: true,
    imports: [CommonModule,FormsModule, NgxEditorModule, ListLegalProvisionsComponent],
    templateUrl: './monada-edit.component.html',
    styleUrl: './monada-edit.component.css',
})
export class MonadaEditComponent implements OnInit, OnDestroy {
    organizationalUnitService = inject(OrganizationalUnitService);
    monadesService = inject(MonadesService);
    constService = inject(ConstService);
    modalService = inject(ModalService);
    legalProvisionService = inject(LegalProvisionService);
    sanitizer = inject(DomSanitizer);

    legalProvisionsNeedUpdate = this.legalProvisionService.legalProvisionsNeedUpdate;
    legalProvisionObjectUpdate = this.legalProvisionService.legalProvisionObjectUpdate;

    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;

    monada_id: string;

    provisionText: string = '';
    originalProvisionText: string;

    organizationalUnit: IOrganizationUnit;
    modalRef: any;

    monada: IMonada;
    showInfoText: string = '';

    legalProvisions: ILegalProvision[] = [];
    originalLegalProvisions: ILegalProvision[] = [];

    constructor() {
        effect(
            () => {
              if (this.legalProvisionsNeedUpdate()) {
                  this.getLegalProvisionsByRegulatedOrganizationalUnit(this.monada.code);
                  this.legalProvisionsNeedUpdate.set(false);
              }
              if (this.legalProvisionObjectUpdate()) {
                // console.log("Effect>>",this.legalProvisionObjectUpdate().legalProvisionText);
                this.updateRemitTextWithNewProvision(this.legalProvisionObjectUpdate().legalProvisionText);
                this.legalProvisionObjectUpdate.set(null);
              }
            },
            { allowSignalWrites: true },
        );
    }

    ngOnInit() {
        this.organizationalUnitService
            .getOrganizationalUnitDetails(this.monada_id)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizationalUnit = data;
            });

        this.monadesService
            .getMonada(this.monada_id)
            .pipe(take(1))
            .subscribe((data) => {
                // console.log('GET MONADA', data);
                this.monada = data;

                this.provisionText = this.monada.provisionText;
                this.originalProvisionText = this.monada.provisionText;

                this.getLegalProvisionsByRegulatedOrganizationalUnit(this.monada.code);
                // this.getLegalProvisionsByRegulatedOrganizationalUnit(this.monada_id);
            });
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    getLegalProvisionsByRegulatedOrganizationalUnit(code: string): void {
        this.legalProvisionService.getLegalProvisionsByRegulatedOrganizationUnit(code).subscribe((data) => {
            // console.log('GET LEGAL PROVISIONS BY REGULATED ORGANIZATIONAL UNIT', data);
            this.legalProvisions = data;
            this.originalLegalProvisions = cloneDeep(this.legalProvisions);
        });
    }

    onSubmit() {
        // filter this.legalProvisions to get only new ones
        const newLegalProvisions = this.legalProvisions.filter((provision) => provision.isNew);
        const organizationalUnit = {
            // code: this.monada.code,
            code: this.monada_id,
            provisionText: this.provisionText,
            // legalProvisions: this.legalProvisions,
            legalProvisions: newLegalProvisions,
        } as IMonada;

        // console.log(organizationalUnit);

        this.monadesService
            .updateMonada(organizationalUnit)
            .pipe(take(1))
            .subscribe((response) => {
                // console.log(response);
                this.modalRef.dismiss();
            });
    }

    newLegalProvision(): void {
        this.modalService.newLegalProvision().subscribe((data) => {
            if (data) {
                const newLegalProvision = { ...data.legalProvision, isNew: true };
                const tempLegalProvision = [newLegalProvision, ...this.legalProvisions];
                this.legalProvisions = uniqWith(tempLegalProvision, (a, b) => {
                    return a.legalActKey === b.legalActKey && isEqual(a.legalProvisionSpecs, b.legalProvisionSpecs);
                });
                this.updateRemitTextWithNewProvision(data.legalProvision.legalProvisionText);
            }
        });
    }

    updateRemitTextWithNewProvision(newText: string) {
        const remitText = this.provisionText;
        
        if (!(this.legalProvisions.length===1 && ('isNew' in this.legalProvisions[0]))) {          
          this.showInfoText = "<p style='color:red'>Στο πάνω μέρος του Κειμένου Πρόβλεψης της Μονάδας, εμφανίζεται το κείμενο της τελευταίας διάταξης που έχετε εισάγει. Στο κάτω μέρος εμφανίζεται το προγενέστερο κείμενο <strong>ως είχε πριν την τελευταία τροποποίηση</strong>. Επεξεργαστείτε και κωδικοποιήστε το κείμενο της πρόβλεψης για τη σύσταση ή/και το σκοπό/στόχους της Μονάδας <strong>όπως ισχύει ενιαία με την τελευταία τροποποιητική διάταξη</strong>.</p>";
        }
          
        // const updatedtext = `<p style="color:red"><strong>Ελέγξτε και τροποποιήστε το συνολικό κείμενο της Αρμοδιότητας μετά την τελευταία προσθήκη Διάταξης:</strong></p>${newText}${remitText}`;
        if (remitText) {
            this.provisionText = `${newText}${remitText}`;
        } else {
            this.provisionText = `${newText}`;
        }

    }

    sanitizeHtml(html) : SafeHtml {
        if (html) {
            return this.sanitizer.bypassSecurityTrustHtml(html);
        } else {
            return ""
        }
    }

    hasChanges(): boolean {
        return (
            this.provisionText !== this.originalProvisionText ||
            !isEqual(this.legalProvisions, this.originalLegalProvisions)
        );
    }

    onProvisionTextChange(html: object) {
        this.provisionText = html.toString();
    }

    dismiss() {
        if (this.hasChanges()) {
            this.modalService
                .getUserConsent(
                    `Αν κλείσετε το παράθυρο οι αλλαγές της Μονάδας <strong>${this.organizationalUnit.preferredLabel}</strong>  δεν θα αποθηκευτούν! Παρακαλούμε επιβεβαιώστε την ενέργεια.`,
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
