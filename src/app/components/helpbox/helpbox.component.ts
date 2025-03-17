import { Component, inject } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorsComponent } from './editors/editors.component';
import { HelpdeskComponent } from './helpdesk/helpdesk.component';
import { FaqComponent } from './faq/faq.component';
import { GeneralInfoComponent } from './general-info/general-info.component';
import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-helpbox',
  standalone: true,
  imports: [NgbNavModule, EditorsComponent, HelpdeskComponent, FaqComponent, GeneralInfoComponent],
  templateUrl: './helpbox.component.html',
  styleUrl: './helpbox.component.css'
})
export class HelpboxComponent {
  userService = inject(UserService);
  router = inject(Router);
  route = inject(ActivatedRoute)

  active: number = 1; 

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.changeTab(params['tab']);
      }
    });
  }

  changeTab(tabIndex: number): void {
    this.active = +tabIndex; // Change the active tab
  }

  hasHelpDeskRole() {
    return this.userService.hasHelpDeskRole();
  }

  hasEditorRole() {
    return this.userService.hasEditorRole();
  }
}