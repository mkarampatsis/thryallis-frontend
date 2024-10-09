import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { IOrganization } from 'src/app/shared/interfaces/organization';
import { ConstService } from 'src/app/shared/services/const.service';
import { take } from 'rxjs';
import { IForeas } from 'src/app/shared/interfaces/foreas/foreas.interface';
import { ForeasService } from 'src/app/shared/services/foreas.service';
import { ILegalProvision } from '../../interfaces/legal-provision/legal-provision.interface';
import { ModalService } from '../../services/modal.service';
import { ListLegalProvisionsComponent } from '../../components/list-legal-provisions/list-legal-provisions.component';
import { LegalProvisionService } from '../../services/legal-provision.service';
import { cloneDeep, isEqual, uniqWith } from 'lodash-es';
import { DEFAULT_TOOLBAR, Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
    selector: 'app-foreas-edit',
    standalone: true,
    imports: [FormsModule, NgxEditorModule, ListLegalProvisionsComponent],
    templateUrl: './foreas-edit.component.html',
    styleUrl: './foreas-edit.component.css',
})
export class ForeasEditComponent implements OnInit, OnDestroy {
    organizationService = inject(OrganizationService);
    foreasService = inject(ForeasService);
    constService = inject(ConstService);
    modalService = inject(ModalService);
    legalProvisionService = inject(LegalProvisionService);

    legalProvisionsNeedUpdate = this.legalProvisionService.legalProvisionsNeedUpdate;

    editor: Editor = new Editor();
    toolbar: Toolbar = DEFAULT_TOOLBAR;

    foreas_id: string;
    level: string;
    originalLevel: string;

    provisionText: string;
    originalProvisionText: string;

    organization: IOrganization;
    modalRef: any;

    foreas: IForeas;

    organizationLevels = this.constService.ORGANIZATION_LEVELS;

    legalProvisions: ILegalProvision[] = [];
    originalLegalProvisions: ILegalProvision[] = [];

    constructor() {
        effect(
            () => {
                if (this.legalProvisionsNeedUpdate()) {
                    this.getLegalProvisionsByRegulatedOrganization(this.foreas.code);
                    this.legalProvisionsNeedUpdate.set(false);
                }
            },
            { allowSignalWrites: true },
        );
    }

    ngOnInit() {
        this.organizationService
            .getOrganizationDetails(this.foreas_id)
            .pipe(take(1))
            .subscribe((data) => {
                this.organization = data;
            });

        this.foreasService
            .getForeas(this.foreas_id)
            .pipe(take(1))
            .subscribe((data) => {
                this.foreas = data;

                this.level = this.foreas.level;
                this.originalLevel = this.foreas.level;

                this.provisionText = this.foreas.provisionText;
                this.originalProvisionText = this.foreas.provisionText;

                // this.legalProvisionService
                //     .getLegalProvisionsByRegulatedOrganization(this.foreas.code)
                //     .pipe(take(1))
                //     .subscribe((data) => {
                //         this.legalProvisions = data;
                //         this.originalLegalProvisions = cloneDeep(this.legalProvisions);
                //     });
                this.getLegalProvisionsByRegulatedOrganization(this.foreas.code);
            });
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    getLegalProvisionsByRegulatedOrganization(code: string) {
        this.legalProvisionService
            .getLegalProvisionsByRegulatedOrganization(code)
            .pipe(take(1))
            .subscribe((data) => {
                this.legalProvisions = data;
                this.originalLegalProvisions = cloneDeep(this.legalProvisions);
            });
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const text = event.clipboardData?.getData('text');
        console.log('Pasting...', text);
        this.provisionText = text;
    }

    onProvisionTextChange(html: object) {
        this.provisionText = html.toString();
    }

    onSubmit() {
        // filter this.legalProvisions to get only new ones
        const newLegalProvisions = this.legalProvisions.filter((provision) => provision.isNew);
        const organization = {
            code: this.foreas.code,
            level: this.level,
            provisionText: this.provisionText,
            // legalProvisions: this.legalProvisions,
            legalProvisions: newLegalProvisions,
        } as IForeas;

        console.log(organization);

        this.foreasService
            .updateForeas(organization)
            .pipe(take(1))
            .subscribe((response) => {
                console.log(response);
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
            }
        });
    }

    hasChanges(): boolean {
        return (
            this.level !== this.originalLevel ||
            this.provisionText !== this.originalProvisionText ||
            !isEqual(this.legalProvisions, this.originalLegalProvisions)
        );
    }

    dismiss() {
        if (this.hasChanges()) {
            this.modalService
                .getUserConsent(
                    `Αν κλείσετε το παράθυρο οι αλλαγές του Φορέα <strong>${this.organization.preferredLabel}</strong>  δεν θα αποθηκευτούν! Παρακαλούμε επιβεβαιώστε την ενέργεια.`,
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
