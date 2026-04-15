import { Route } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { DashboardComponent } from './dashboard.component';
import { EditorGuard } from 'src/app/shared/guards/editor.guard';

export const DashboardRoutes: Route[] = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, EditorGuard],
  },
];
