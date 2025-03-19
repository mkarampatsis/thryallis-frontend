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
import { ActivatedRoute, Router } from '@angular/router';

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
    router = inject(Router);
    route = inject(ActivatedRoute);

    store = inject(Store<AppState>);

    ngOnInit(): void {
        this.store.dispatch(loadOrganizations());
        this.store.dispatch(loadOrganizationalUnits());
        this.store.dispatch(loadRemits());

        // let urlParams = new URLSearchParams(window.location.search);
        // let code = urlParams.get('code');

        // console.log("Extracted Code from window.location:", code);

        // // Check if "code" query param exists
        // this.route.queryParams.subscribe(params => {
        //     console.log("app initialized with query params", params);
        //     if (params['code']) {
        //         console.log("Navigating to login with code:", params['code']);
        //         this.router.navigate(['/login'], { queryParams: { code: params['code'] } });
        //     }
        // });
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
