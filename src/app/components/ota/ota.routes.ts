import { Route } from '@angular/router';
import { OtaComponent } from './ota.component';
import { OtaDetailsComponent } from './ota-details/ota-details.component';
import { SearchComponent } from './search/search.component';
import { InstructionProvisionsComponent } from './instruction-provisions/instruction-provisions.component';

export const OtaRoutes: Route[] = [
    {
        path: '',
        component: OtaComponent,
    },
    {
        path: 'details',
        component: OtaDetailsComponent,
    },
    {
        path: 'search',
        component: SearchComponent,
    },
    {
        path: 'instruction-provisions',
        component: InstructionProvisionsComponent,
    },
];
