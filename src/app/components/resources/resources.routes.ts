import { Route } from '@angular/router';

import { FacilityComponent } from './facility/facility.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { EmployeeComponent } from './employee/employee.component';
import { EquipmentAdminComponent } from './equipment-admin/equipment-admin.component';
import { FacilityAdminComponent } from './facility-admin/facility-admin.component';
import { SearchComponent } from './search/search.component';
import { EmployeeAdminComponent } from './employee-admin/employee-admin.component';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { HasOneRoleGuard } from 'src/app/shared/guards/hasOneRoles.guard';
import { EquipmentGuard } from 'src/app/shared/guards/equipement.guard';
import { FacilityGuard } from 'src/app/shared/guards/facility.guard';

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
    canActivate: [AuthGuard, EquipmentGuard]
  },
  {
    path: 'facility-admin',
    component: FacilityAdminComponent,
    canActivate: [AuthGuard, FacilityGuard]
  },
  {
    path: 'employee-admin',
    component: EmployeeAdminComponent,
    canActivate: [AuthGuard, HasOneRoleGuard]
  },
  {
    path:'search',
    component: SearchComponent
  }
];