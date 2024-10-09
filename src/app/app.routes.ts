import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'psped',
        loadChildren: () => import('./components/psped/psped.routes').then((m) => m.PspedRoutes),
    },
    {
        path: 'foreis',
        loadChildren: () => import('./components/foreis/foreis.routes').then((m) => m.ForeisRoutes),
    },
    {
        path: 'monades',
        loadChildren: () => import('./components/monades/monades.routes').then((m) => m.MonadesRoutes),
    },
    {
        path: 'search',
        loadChildren: () => import('./components/search/search.routes').then((m) => m.SearchRoutes),
    },
    {
        path: 'nomikes-praxeis',
        loadChildren: () =>
            import('./components/nomikes-praxeis/nomikes-praxeis.routes').then((m) => m.NomikesPraxeisRoutes),
    },
    {
        path: 'diataxeis',
        loadChildren: () => import('./components/diataxeis/diataxeis.routes').then((m) => m.DiataxeisRoutes),
    },
    {
        path: 'armodiothtes',
        loadChildren: () => import('./components/armodiothtes/armodiothtes.routes').then((m) => m.ArmodiothtesRoutes),
    },
    {
        path: 'login',
        loadChildren: () => import('./components/login/login.routes').then((m) => m.LoginRoutes),
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./components/dashboard/dashboard.routes').then((m) => m.DashboardRoutes),
    },
    {
        path: 'user-admin',
        loadChildren: () => import('./components/user-admin/user-admin.routes').then((m) => m.UserAdminRoutes),
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];
