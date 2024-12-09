import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/services/auth.guard';
import { HelpboxComponent } from './helpbox.component';

export const HelpBoxRoutes: Route[] = [
  { path: '', component: HelpboxComponent, canActivate: [AuthGuard] }
];
