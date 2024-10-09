import { Component, inject, HostListener, OnInit } from '@angular/core';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContentComponent } from './components/content/content.component';

import { AuthService } from './shared/services/auth.service';
import { ConstService } from './shared/services/const.service';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { Store } from '@ngrx/store';
import { AppState } from './shared/state/app.state';
import { loadOrganizations } from './shared/state/organizations.state';
import { loadOrganizationalUnits } from './shared/state/organizational-units.state';
import { loadRemits } from './shared/state/remits.state';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NavigationComponent, ContentComponent, FooterComponent, ToastContainerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    authService = inject(AuthService);
    constService = inject(ConstService);

    store = inject(Store<AppState>);

    ngOnInit(): void {
        this.store.dispatch(loadOrganizations());
        this.store.dispatch(loadOrganizationalUnits());
        this.store.dispatch(loadRemits());
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: any) {
        if (this.authService.user()) {
            // event.preventDefault();
            this.authService.signOut();
        }
        return true;
    }
}
