import { Component } from '@angular/core';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-show-legal-provision',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './show-legal-provision.component.html',
    styleUrl: './show-legal-provision.component.css',
})
export class ShowLegalProvisionComponent {
    legalProvision: ILegalProvision;
    modalRef: any;
}
