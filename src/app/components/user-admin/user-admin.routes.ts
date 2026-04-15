import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { AdminGuard } from 'src/app/shared/guards/admin.guard';
import { UserAdminComponent } from './user-admin.component';

export const UserAdminRoutes: Route[] = [
    { path: '', component: UserAdminComponent, canActivate: [AuthGuard, AdminGuard] }
];
