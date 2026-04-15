import { Route } from '@angular/router';
import { OtaComponent } from './ota.component';
import { OtaDetailsComponent } from './ota-details/ota-details.component';
import { SearchComponent } from './search/search.component';
import { InstructionProvisionsComponent } from './instruction-provisions/instruction-provisions.component';
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
    // canActivate: [AuthGuard, OtaGuard]
  },
  {
    path: 'search',
    component: SearchComponent,
    // canActivate: [AuthGuard, OtaGuard]
  },
  {
    path: 'instruction-provisions',
    component: InstructionProvisionsComponent,
    // canActivate: [AuthGuard, OtaGuard]
  },
];
