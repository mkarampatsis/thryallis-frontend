import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Route[] = [
    {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
    },
];
