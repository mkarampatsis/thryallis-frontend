import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { ConstService } from 'src/app/shared/services/const.service';
import { IRemit } from '../../interfaces/remit/remit.interface'
import { RemitService } from '../../services/remit.service';
import { ListLegalProvisionsComponent } from '../../components/list-legal-provisions/list-legal-provisions.component';

@Component({
  selector: 'app-remit-details',
  standalone: true,
  imports: [CommonModule, ListLegalProvisionsComponent],
  templateUrl: './remit-details.component.html',
  styleUrl: './remit-details.component.css'
})
export class RemitDetailsComponent {
  constService = inject(ConstService);
  remitService = inject(RemitService);

  organizationalUnitCode: string | null = null;
  remitId: string | null = null;

  data: { organizationCode: string; remitId: string };

  remit: IRemit = null;
  modalRef: any;

  ngOnInit(): void {
    this.remitService.getRemitById(this.data.remitId)
     .pipe(take(1))
      .subscribe((result) => {
        this.remit = result;
      });
  }

  getCofogNames(cofog: { cofog1: string; cofog2: string; cofog3: string }) {
    const { cofog1, cofog2, cofog3 } = cofog;
    return this.constService.getCofogNames(cofog1, cofog2, cofog3);
  }
}
