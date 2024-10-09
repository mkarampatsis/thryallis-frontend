import { OrganizationalUnitsState } from './organizational-units.state';
import { OrganizationsState } from './organizations.state';
import { RemitsState } from './remits.state';

export interface AppState {
    organizations: OrganizationsState;
    organizationalUnits: OrganizationalUnitsState;
    remits: RemitsState;
}
