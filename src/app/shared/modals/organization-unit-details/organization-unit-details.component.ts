import { Component, effect, inject } from '@angular/core';
import { OrganizationalUnitService } from 'src/app/shared/services/organizational-unit.service';
import { IOrganizationUnit } from 'src/app/shared/interfaces/organization-unit';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbAccordionModule, NgbAlertModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CardRowRightLeftComponent } from 'src/app/shared/components/card-row-right-left/card-row-right-left.component';
import { ConstService } from 'src/app/shared/services/const.service';
import { RemitService } from '../../services/remit.service';
import { IRemit } from '../../interfaces/remit/remit.interface';
import { ListLegalProvisionsComponent } from '../../components/list-legal-provisions/list-legal-provisions.component';
import { LegalProvisionService } from '../../services/legal-provision.service';
import { ILegalProvision } from '../../interfaces/legal-provision/legal-provision.interface';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { ICofog } from '../../interfaces/cofog/cofog.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { setOrgnizationalUnitremitsFinalized } from '../../state/organizational-units.state';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-organization-unit-details',
    standalone: true,
    imports: [
        CommonModule,
        NgbModalModule,
        CardRowRightLeftComponent,
        ListLegalProvisionsComponent,
        NgbAccordionModule,
        NgbAlertModule,
        NgbTooltipModule,
    ],
    templateUrl: './organization-unit-details.component.html',
    styleUrl: './organization-unit-details.component.css',
})
export class OrganizationUnitDetailsComponent {
    organizationalUnitService = inject(OrganizationalUnitService);
    constService = inject(ConstService);
    remitService = inject(RemitService);
    modalService = inject(ModalService);
    authService = inject(AuthService);
    legalProvisionService = inject(LegalProvisionService);

    user = this.authService.user;
    store = inject(Store<AppState>);

    legalProvisionsNeedUpdate = this.legalProvisionService.legalProvisionsNeedUpdate;
    legalProvisions: ILegalProvision[] = [];
    provisionText = ''
    remitsNeedUpdate = this.remitService.remitsNeedUpdate;

    // remits: IRemit[] = [];
    remitsEnabled: IRemit[] = [];
    remitsDisabled: IRemit[] = [];
    showDisabled: Boolean = false;
    showDetails: Boolean = false;

    organizationalUnitCode: string | null = null;
    // organizationalUnit: IOrganizationUnit | null = null;
    organizationalUnit: any | null = null;
    organizationalUnitRemitsFinalized: boolean = false;
    modalRef: any;

    ngOnInit() {
        this.organizationalUnitService
            .getOrganizationalUnitDetails(this.organizationalUnitCode)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizationalUnit = data;
                console.log(">>1",this.organizationalUnit);
            });
        
        this.getRemits(this.organizationalUnitCode)
        // this.remitService
        //     .getRemitsByCode(this.organizationalUnitCode)
        //     .pipe(take(1))
        //     .subscribe((data) => {
        //         this.remits = data;
        //     });

        this.organizationalUnitService
            .getMonadaPsped(this.organizationalUnitCode)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizationalUnitRemitsFinalized = data.remitsFinalized;
                console.log(">>2",data.provisionText);
                this.provisionText = data.provisionText
            });
        
        this.legalProvisionService
            .getLegalProvisionsByRegulatedOrganizationUnit(this.organizationalUnitCode)
            .subscribe((data) => {
                this.legalProvisions = data;
        });
    }

    constructor() {
        effect(
            () => {
                if (this.legalProvisionsNeedUpdate()) {
                    this.getRemits(this.organizationalUnitCode)
                    // this.remitService
                    //     .getRemitsByCode(this.organizationalUnitCode)
                    //     .pipe(take(1))
                    //     .subscribe((data) => {
                    //         this.remits = data;
                    //     });
                    this.legalProvisionsNeedUpdate.set(false);
                }

                if (this.remitsNeedUpdate()) {
                    this.getRemits(this.organizationalUnitCode)
                    // this.remitService
                    //     .getRemitsByCode(this.organizationalUnitCode)
                    //     .pipe(take(1))
                    //     .subscribe((data) => {
                    //         this.remits = data;
                    //     });
                    this.remitsNeedUpdate.set(false);
                }
            },
            { allowSignalWrites: true },
        );
    }

    descriptionMap(entry: { description: string }[] | undefined) {
        if (entry) return entry.map((entry) => entry.description);
    }

    fullAddressMap(entry: { fullAddress: string }[] | undefined) {
        if (entry) return entry.map((entry) => entry.fullAddress);
    }

    organizationPrefferedLabel(code: string) {
        return this.constService.getOrganizationPrefferedLabelByCode(code);
    }

    organizationUnitPrefferedLabel(code: string) {
        return this.constService.getOrganizationUnitPrefferedLabelByCode(code);
    }

    updateRemit(remit: IRemit) {
        // console.log(this.organizationalUnitCode, this.organizationUnitPrefferedLabel(this.organizationalUnitCode));
        this.modalService.editRemit(
            {
                preferredLabel: this.organizationUnitPrefferedLabel(this.organizationalUnitCode),
                code: this.organizationalUnitCode,
            },
            remit,
        );
    }

    newRemit() {
        this.modalService.newRemit({
            code: this.organizationalUnit.code,
            preferredLabel: this.organizationalUnit.preferredLabel,
        });
    }

    canEdit(code: string) {
        if(this.user()) {
            return this.authService.canEdit(code);
        } else {
            return true
        }
    }

    getCofogNames(cofog: { cofog1: string; cofog2: string; cofog3: string }) {
        const { cofog1, cofog2, cofog3 } = cofog;
        return this.constService.getCofogNames(cofog1, cofog2, cofog3);
    }

    setRemitsFinalized(status: boolean) {
        this.organizationalUnitService
            .finalizeRemits(this.organizationalUnitCode, status)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizationalUnitRemitsFinalized = data.remitsFinalized;
                this.store.dispatch(
                    setOrgnizationalUnitremitsFinalized({
                        code: this.organizationalUnitCode,
                        remitsFinalized: data.remitsFinalized,
                    }),
                );
            });
    }

    showDisabledRemits(status:boolean){
        this.showDisabled = status
    }

    showDetailsRemits(status:boolean){
        this.showDetails = status
    }

    getRemits(code:string){
        this.remitService
            .getRemitsByCode(code)
            .pipe(take(1))
            .subscribe((data) => {
                this.remitsEnabled = data.filter(item => item.status==="ΕΝΕΡΓΗ")
                this.remitsDisabled = data.filter(item => item.status==="ΑΝΕΝΕΡΓΗ")
                // this.remits = data;
            });
    }

    deleteRemit(id:string){
        // console.log(id);
        this.modalService
            .getUserConsent(
                `Θέλετε να διαγράψετε μια αρμοδιότητα! Παρακαλούμε επιβεβαιώστε την ενέργεια.`,
            )
            .pipe(take(1))
            .subscribe((consent) => {
                // console.log(">>>", consent)
                if (consent) {
                    // this.modalRef.dismiss();
                    this.remitService.deleteRemitByID(id)
                        .subscribe(data => {
                            console.log(data)
                            this.getRemits(this.organizationalUnitCode)
                        })
                }
            });
    }

    copyRemit(id:string){
        // console.log(id);
        this.modalService
            .getUserConsent(
                `Θέλετε να αντιγράψετε την συγκεκριμένη αρμοδιότητα! Παρακαλούμε επιβεβαιώστε την ενέργεια.`,
            )
            .pipe(take(1))
            .subscribe((consent) => {
                // console.log(">>>", consent)
                if (consent) {
                    // this.modalRef.dismiss();
                    this.remitService.copyRemit(id)
                        .subscribe(data => {
                            // console.log(data)
                            this.modalService.editRemit(
                                {
                                    preferredLabel: this.organizationUnitPrefferedLabel(this.organizationalUnitCode),
                                    code: this.organizationalUnitCode,
                                },
                                data.remit,
                            );
                        })
                }
            });
    }
}
