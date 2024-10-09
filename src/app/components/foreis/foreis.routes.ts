import { Route } from '@angular/router';
import { ForeisComponent } from './foreis.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const ForeisRoutes: Route[] = [
    {
        path: '',
        component: ForeisComponent,
        canActivate: [AuthGuard],
    },
];
