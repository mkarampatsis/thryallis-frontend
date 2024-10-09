import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { NomikesPraxeisComponent } from './nomikes-praxeis.component';

export const NomikesPraxeisRoutes: Route[] = [
    {
        path: '',
        component: NomikesPraxeisComponent,
        canActivate: [AuthGuard],
    },
];
