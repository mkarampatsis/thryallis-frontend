import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { ConstService } from 'src/app/shared/services/const.service';
import { IRemit } from '../../interfaces/remit/remit.interface'
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { selectRemitById$ } from '../../state/remits.state';

@Component({
  selector: 'app-remit-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remit-details.component.html',
  styleUrl: './remit-details.component.css'
})
export class RemitDetailsComponent {
    constService = inject(ConstService);
    // remitService = inject(RemitService);

    store = inject(Store<AppState>);
    remitById$ = selectRemitById$;


    organizationalUnitCode: string | null = null;
    remitId: string | null = null;

    data: { organizationCode: string; remitId: string };

    remit: IRemit;
    modalRef: any;

    ngOnInit() : void {
        this.store
            .select(this.remitById$(this.data.remitId))
            .pipe(take(1))
            .subscribe((result) => {
                this.remit = result[0];
            });
    }

    getCofogNames(cofog: { cofog1: string; cofog2: string; cofog3: string }) {
        const { cofog1, cofog2, cofog3 } = cofog;
        return this.constService.getCofogNames(cofog1, cofog2, cofog3);
    }
}
