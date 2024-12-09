import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorsComponent } from './editors/editors.component';
import { HelpdeskComponent } from './helpdesk/helpdesk.component';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-helpbox',
  standalone: true,
  imports: [NgbNavModule, EditorsComponent, HelpdeskComponent],
  templateUrl: './helpbox.component.html',
  styleUrl: './helpbox.component.css'
})
export class HelpboxComponent {
  userService = inject(UserService);
  active = 1;

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  hasEditorRole() {
    return this.userService.hasEditorRole();
  }
}