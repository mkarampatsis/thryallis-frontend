import { Route } from '@angular/router';
import { OtaComponent } from './ota.component';
import { OtaDetailsComponent } from './ota-details/ota-details.component';
import { SearchComponent } from './search/search.component';
import { InstructionProvisionsComponent } from './instruction-provisions/instruction-provisions.component';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { HasOneRoleGuard } from 'src/app/shared/guards/hasOneRoles.guard';
import { OtaGuard } from 'src/app/shared/guards/ota.guard';
// import { OtaGuard } from 'src/app/shared/guards/ota.guard';
// import { AuthGuard } from 'src/app/shared/guards/auth.guard';

export const OtaRoutes: Route[] = [
  {
    path: '',
    component: OtaComponent,
    // canActivate: [AuthGuard, OtaGuard]
  },
  {
    path: 'details',
    component: OtaDetailsComponent,
    canActivate: [AuthGuard, HasOneRoleGuard, OtaGuard]
  },
  {
    path: 'search',
    component: SearchComponent,
    // canActivate: [AuthGuard, HasOneRoleGuard, OtaGuard]
  },
  {
    path: 'instruction-provisions',
    component: InstructionProvisionsComponent,
    canActivate: [AuthGuard, HasOneRoleGuard, OtaGuard]
  },
];
