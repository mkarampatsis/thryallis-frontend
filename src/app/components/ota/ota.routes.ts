import { Route } from '@angular/router';
import { OtaComponent } from './ota.component';
import { OtaEditComponent } from './ota-edit/ota-edit.component';
import { OtaSearchComponent } from './ota-search/ota-search.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const OtaRoutes: Route[] = [
    {
        path: '',
        component: OtaComponent,
    },
    {
        path: 'details',
        component: OtaEditComponent,
        // canActivate: [AuthGuard],
    },
    {
        path: 'search',
        component: OtaSearchComponent,
    },
];
