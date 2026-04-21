import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { HelpboxComponent } from './helpbox.component';
import { HelpBoxGuard } from 'src/app/shared/guards/helpbox.guard';
import { HasOneRoleGuard } from 'src/app/shared/guards/hasOneRoles.guard';

export const HelpBoxRoutes: Route[] = [
  { path: '', component: HelpboxComponent, canActivate: [AuthGuard, HasOneRoleGuard, HelpBoxGuard] }
];
