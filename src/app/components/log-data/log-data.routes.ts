import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { LogDataComponent } from './log-data.component';

export const LogDataRoutes: Route[] = [{ path: '', component: LogDataComponent, canActivate: [AuthGuard] }];
