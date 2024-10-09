import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { DiataxeisComponent } from './diataxeis.component';

export const DiataxeisRoutes: Route[] = [
    {
        path: '',
        component: DiataxeisComponent,
        canActivate: [AuthGuard],
    },
];
