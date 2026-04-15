import { Route } from '@angular/router';
import { PspedComponent } from './psped.component';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';

export const PspedRoutes: Route[] = [
    {
        path: '',
        component: PspedComponent,
        canActivate: [AuthGuard],
    },
];
