import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ISearch } from '../interfaces/search/search.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { take } from 'rxjs';
import { selectOrganizationalUnitByOrganizationCode$} from 'src/app/shared/state/organizational-units.state';
import { Organization } from '../interfaces/search/search.interface';
import { ConstService } from './const.service';

const APIPREFIX = `${environment.elasticUrl}/search`;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
    http = inject(HttpClient);
    constService = inject(ConstService);
    unitTypes = this.constService.UNIT_TYPES;

    store = inject(Store<AppState>);
    selectOrganizationalUnitByOrganizationCode$ = selectOrganizationalUnitByOrganizationCode$;
    
    postSearch(data:any): Observable<any> {
        return this.http.post<ISearch>(APIPREFIX, data);
    };

    showMatrix1(selectedOrganizations:Organization[]){
        let selectedOrganizationalUnits = []
        for (let data of selectedOrganizations) {
            this.store
            .select(this.selectOrganizationalUnitByOrganizationCode$(data.code))
            .pipe(take(1))
            .subscribe((orgCodes) => {
                  selectedOrganizationalUnits = selectedOrganizationalUnits.concat(...orgCodes)
                
            });
        }

        // Group by unitType and organizationCode
        const result = selectedOrganizationalUnits.reduce((acc, item) => {
            const { unitType, organizationCode } = item;
            const unitTypeDescription = this.unitTypes.find(type => type.id === unitType)?.description || "Unknown Type";
        
            // Find if this combination already exists in the accumulator
            const existingEntry = acc.find(entry => entry.unitType === unitType && entry.organizationCode === organizationCode);
        
            if (existingEntry) {
            // If it exists, increment the count
            existingEntry.count += 1;
            } else {
            // If it doesn't exist, create a new entry
            acc.push({
                description: unitTypeDescription,
                unitType: unitType,
                organizationCode: organizationCode,
                count: 1
            });
            }
        
            return acc;
        }, []);
          
        return result
    }
}
