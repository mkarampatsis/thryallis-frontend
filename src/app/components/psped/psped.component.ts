import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { ForeasService } from 'src/app/shared/services/foreas.service';
import { LegalActService } from 'src/app/shared/services/legal-act.service';
import { LegalProvisionService } from 'src/app/shared/services/legal-provision.service';
import { MonadesService } from 'src/app/shared/services/monades.service';
import { RemitService } from 'src/app/shared/services/remit.service';

@Component({
    selector: 'app-psped',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './psped.component.html',
    styleUrl: './psped.component.css',
})
export class PspedComponent implements OnInit {
    foreasService = inject(ForeasService);
    monadesService = inject(MonadesService);
    remitService = inject(RemitService);
    legalActService = inject(LegalActService);
    legalProvisionService = inject(LegalProvisionService);
    foreasCount = 0;
    monadesCount = 0;
    remitCount = 0;
    legalActCount = 0;
    legalProvisionCount = 0;

    ngOnInit(): void {
        this.foreasService
            .count()
            .pipe(take(1))
            .subscribe((response) => {
                this.foreasCount = response.count;
            });

        this.monadesService
            .count()
            .pipe(take(1))
            .subscribe((response) => {
                this.monadesCount = response.count;
            });

        this.remitService
            .count()
            .pipe(take(1))
            .subscribe((response) => {
                this.remitCount = response.count;
            });

        this.legalActService
            .count()
            .pipe(take(1))
            .subscribe((response) => {
                this.legalActCount = response.count;
            });

        this.legalProvisionService
            .count()
            .pipe(take(1))
            .subscribe((response) => {
                this.legalProvisionCount = response.count;
            });
    }
}
