import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { AdminGuard } from 'src/app/shared/services/admin.guard ';
import { UserAdminComponent } from './user-admin.component';

export const UserAdminRoutes: Route[] = [
    { path: '', component: UserAdminComponent, canActivate: [AuthGuard, AdminGuard] }
];
