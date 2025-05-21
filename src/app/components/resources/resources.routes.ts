import { Route } from '@angular/router';

import { FacilityComponent } from './facility/facility.component';
import { EquipmentComponent } from './equipment/equipment.component';

export const ResourcesRoutes: Route[] = [
  {
    path: 'facility',
    component: FacilityComponent,
  },
  {
    path: 'equipment',
    component: EquipmentComponent,
  }
];