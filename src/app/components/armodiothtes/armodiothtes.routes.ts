import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { ArmodiothtesComponent } from './armodiothtes.component';

export const ArmodiothtesRoutes: Route[] = [
    {
        path: '',
        component: ArmodiothtesComponent,
        canActivate: [AuthGuard],
    },
];
