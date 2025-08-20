import { Route } from '@angular/router';
import { SearchComponent } from './search.component';

export const SearchRoutes: Route[] = [
    {
        path: '',
        component: SearchComponent,
        // canActivate: [AuthGuard],
    },
];
