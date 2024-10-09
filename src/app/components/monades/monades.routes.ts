import { Route } from '@angular/router';
import { MonadesComponent } from './monades.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

export const MonadesRoutes: Route[] = [
    {
        path: '',
        component: MonadesComponent,
        canActivate: [AuthGuard],
    },
];
