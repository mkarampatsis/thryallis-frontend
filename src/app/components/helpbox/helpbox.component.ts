import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorsComponent } from './editors/editors.component';
import { HelpdeskComponent } from './helpdesk/helpdesk.component';
import { UserService } from 'src/app/shared/services/user.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-helpbox',
  standalone: true,
  imports: [NgbNavModule, EditorsComponent, HelpdeskComponent],
  templateUrl: './helpbox.component.html',
  styleUrl: './helpbox.component.css'
})
export class HelpboxComponent {
  userService = inject(UserService);
  router = inject(Router);

  active: number = 1; 

  changeTab(tabIndex: number): void {
    this.active = tabIndex; // Change the active tab
  }

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  hasEditorRole() {
    return this.userService.hasEditorRole();
  }
}