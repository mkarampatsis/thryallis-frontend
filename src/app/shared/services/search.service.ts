import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ISearch, ISearchGridInput, ISearchGridOutput } from '../interfaces/search/search.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { take } from 'rxjs';
import { selectOrganizationalUnitByOrganizationCode$} from 'src/app/shared/state/organizational-units.state';
import { Organization } from '../interfaces/search/search.interface';
import { IOrganizationUnitList } from '../interfaces/organization-unit';
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

    transformMatrixData_1(selectedOrganizations:Organization[]){
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

    transformMatrixData_2(selectedOrganizations:IOrganizationUnitList[]){
        let selectedOrganizationalUnits = []
        
        for (let data of selectedOrganizations) {
            console.log("service", data);
            this.store
            .select(this.selectOrganizationalUnitByOrganizationCode$(data.organizationCode))
            .pipe(take(1))
            .subscribe((orgCodes) => {
                  selectedOrganizationalUnits = selectedOrganizationalUnits.concat(...orgCodes)
                
            });
        }

        // Group by unitType and organizationCode
        const result = selectedOrganizationalUnits.reduce((acc, item) => {
            const { unitType, organizationCode } = item;
            
            const unitTypeDescription = this.unitTypes.find(type => type.id.toString() === unitType)?.description || "Unknown Type";
        
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

    createGridData(data: ISearchGridInput): ISearchGridOutput[] {
        const result: ISearchGridOutput[] = [];
      
        data.organizations.forEach(org => {
          const orgCode = org.code;
          const orgScore = org.score;
          const orgObjectId = org.object_id;
          const orgPreferredLabel = org.preferredLabel;
      
          if (org["organizational_units"].length === 0) {
            // If organizational_units is empty
            result.push({
              organizationCode: orgCode,
              organizationScore: orgScore,
              organizationObjectId: orgObjectId,
              organizationPreferredLabel: orgPreferredLabel,
              organizationalUnitCode: "",
              organizationalUnitScore: 0,
              organizationalUnitObjectId: "",
              organizationalUnitPreferredLabel: "No Data",
              remitText: "",
              remitObjectId: "",
              remitScore: 0
            });
          } else {
            // Loop through organizational_units
            org.organizational_units.forEach(unit => {
              const unitCode = unit.code;
              const unitScore = unit.score;
              const unitObjectId = unit.object_id;
              const unitPreferredLabel = unit.preferredLabel;
      
              if (unit["remits"].length === 0) {
                // If remits is empty
                result.push({
                  organizationCode: orgCode,
                  organizationScore: orgScore,
                  organizationObjectId: orgObjectId,
                  organizationPreferredLabel: orgPreferredLabel,
                  organizationalUnitCode: unitCode,
                  organizationalUnitScore: unitScore,
                  organizationalUnitObjectId: unitObjectId,
                  organizationalUnitPreferredLabel: unitPreferredLabel,
                  remitText: "No Data",
                  remitObjectId: "",
                  remitScore: 0
                });
              } else {
                // Loop through remits
                unit.remits.forEach(remit => {
                  result.push({
                    organizationCode: orgCode,
                    organizationScore: orgScore,
                    organizationObjectId: orgObjectId,
                    organizationPreferredLabel: orgPreferredLabel,
                    organizationalUnitCode: unitCode,
                    organizationalUnitScore: unitScore,
                    organizationalUnitObjectId: unitObjectId,
                    organizationalUnitPreferredLabel: unitPreferredLabel,
                    remitText: remit.remitText,
                    remitObjectId: remit.object_id,
                    remitScore: remit.score
                  });
                });
              }
            });
          }
        });
      
        return result;
    }
}
