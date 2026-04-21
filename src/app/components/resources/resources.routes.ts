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
import { UserResourcesGuard } from 'src/app/shared/guards/userResources.guard';

export const ResourcesRoutes: Route[] = [
  {
    path: 'facility',
    component: FacilityComponent,
    canActivate: [HasOneRoleGuard]
  },
  {
    path: 'equipment',
    component: EquipmentComponent,
    canActivate: [HasOneRoleGuard]
  },
  {
    path: 'employee',
    component: EmployeeComponent,
    canActivate: [HasOneRoleGuard]
  },
  {
    path: 'equipment-admin',
    component: EquipmentAdminComponent,
    canActivate: [AuthGuard, HasOneRoleGuard, EquipmentGuard]
  },
  {
    path: 'facility-admin',
    component: FacilityAdminComponent,
    canActivate: [AuthGuard, HasOneRoleGuard, FacilityGuard]
  },
  {
    path: 'employee-admin',
    component: EmployeeAdminComponent,
    canActivate: [AuthGuard, HasOneRoleGuard, UserResourcesGuard]
  },
  {
    path:'search',
    component: SearchComponent
  }
];