import { Component } from '@angular/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-yes-no',
    standalone: true,
    imports: [NgbAlertModule],
    templateUrl: './yes-no.component.html',
    styleUrl: './yes-no.component.css',
})
export class YesNoComponent {
    prompt = 'A question with yes/no answer';

    modalRef: any;

    onClick(userConsent: boolean) {
        this.modalRef.dismiss(userConsent);
    }
}
