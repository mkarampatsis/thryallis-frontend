import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';

import { AdminGuard } from 'src/app/shared/guards/admin.guard';
import { LogDataComponent } from './log-data.component';

export const LogDataRoutes: Route[] = [
    { 
       path: '', component: LogDataComponent, canActivate: [AuthGuard, AdminGuard] 
    }
];
