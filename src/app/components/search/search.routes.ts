import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { SearchComponent } from './search.component';

export const SearchRoutes: Route[] = [
    {
        path: '',
        component: SearchComponent,
        canActivate: [AuthGuard],
    },
];
