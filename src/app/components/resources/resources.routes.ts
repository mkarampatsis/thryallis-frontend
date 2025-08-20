import { Route } from '@angular/router';

import { FacilityComponent } from './facility/facility.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { EmployeeComponent } from './employee/employee.component';
import { EquipmentAdminComponent } from './equipment-admin/equipment-admin.component';
import { FacilityAdminComponent } from './facility-admin/facility-admin.component';
import { SearchComponent } from './search/search.component';

export const ResourcesRoutes: Route[] = [
  {
    path: 'facility',
    component: FacilityComponent,
  },
  {
    path: 'equipment',
    component: EquipmentComponent,
  },
  {
    path: 'employee',
    component: EmployeeComponent,
  },
  {
    path: 'equipment-admin',
    component: EquipmentAdminComponent,
  },
  {
    path: 'facility-admin',
    component: FacilityAdminComponent,
  },
  {
    path:'search',
    component: SearchComponent
  }
];