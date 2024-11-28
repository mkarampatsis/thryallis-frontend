import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ISearch, ISearchGridInput, ISearchGridOutput } from '../interfaces/search/search.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { take } from 'rxjs';
import { selectOrganizationalUnitByOrganizationCode$, selectOrganizationalUnitBysupervisorUnitCode$} from 'src/app/shared/state/organizational-units.state';
import {selectRemitByOrganizationalUnitCode$} from 'src/app/shared/state/remits.state'; 
import { Organization } from '../interfaces/search/search.interface';
import { IOrganizationUnitList } from '../interfaces/organization-unit';
import { ConstService } from './const.service';
import { LegalProvisionService } from './legal-provision.service';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';

const APIPREFIX = `${environment.elasticUrl}/search`;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
    http = inject(HttpClient);
    constService = inject(ConstService);
    legalProvision = inject(LegalProvisionService)
    unitTypes = this.constService.UNIT_TYPES;

    store = inject(Store<AppState>);
    selectOrganizationalUnitByOrganizationCode$ = selectOrganizationalUnitByOrganizationCode$;
    selectOrganizationalUnitBysupervisorUnitCode$ = selectOrganizationalUnitBysupervisorUnitCode$;
    selectRemitByOrganizationalUnitCod$ = selectRemitByOrganizationalUnitCode$;
    
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
            this.findChildren(data.code, data.code, selectedOrganizationalUnits)
        }

        // Group by unitType and organizationCode
        const result = selectedOrganizationalUnits.reduce((acc, item) => {
            const { unitType, father } = item;
            
            const unitTypeDescription = this.unitTypes.find(type =>type.id === unitType)?.description || "Unknown Type";
        
            // Find if this combination already exists in the accumulator
            const existingEntry = acc.find(entry => entry.unitType === unitType && entry.organizationCode === father);
            if (existingEntry) {
                // If it exists, increment the count
                existingEntry.count += 1;
            } else {
                // If it doesn't exist, create a new entry
                acc.push({
                    description: unitTypeDescription,
                    unitType: unitType,
                    organizationCode: father,
                    count: 1
                });
            }
            
            return acc;
        }, []);
          
        return result
    }

    findChildren(code: string, fatherCode: string, selectedOrganizationalUnits: any[]){
                
        this.store
            .select(this.selectOrganizationalUnitBysupervisorUnitCode$(code))
            .pipe(take(1))
            .subscribe((orgCodes) => {
                orgCodes.filter(doc => doc.supervisorUnitCode === code)
                .forEach(childDoc => {
                    // Add the current document with necessary fields to the result
                    selectedOrganizationalUnits.push({
                        father: fatherCode,
                        unitType: childDoc.unitType,
                        code: childDoc.code,
                        preferredLabel: childDoc.preferredLabel
                    });

                    // Recursively find children of the current document
                    this.findChildren(childDoc.code, fatherCode, selectedOrganizationalUnits);
                });
            });
        
        return selectedOrganizationalUnits
    }

    transformMatrixData_3(rowsSelected: any, filteredRows: any){
        let selectedRemits = []

        // console.log(rowsSelected, filteredRows)

        if (filteredRows.length===0){
            for (let data of rowsSelected) {
                this.store
                .select(this.selectRemitByOrganizationalUnitCod$(data.organizationalUnitCode))
                .pipe(take(1))
                .subscribe((orgCodes) => {
                    selectedRemits = selectedRemits.concat(...orgCodes)
                    
                });
            }
        } else {
            for (let data of rowsSelected) {
                let remits = []
                // console.log("Service>>",rowsSelected,filteredRows)
                remits = filteredRows.filter(doc => doc.organizationalUnitCode === data.organizationalUnitCode)
                selectedRemits = selectedRemits.concat(...remits)
            }
            // console.log(selectedRemits)
        }
        return selectedRemits
    }

    createGridData(data: ISearchGridInput): ISearchGridOutput[] {
        const result: ISearchGridOutput[] = [];
      
        data.organizations.forEach(org => {
            const orgCode = org.code;
            const orgScore = org.score;
            const orgObjectId = org.object_id;
            const orgPreferredLabel = org.preferredLabel;

            if (!org["organizational_units"]) {
                // If organizational_units is empty
                result.push({
                    organizationCode: orgCode,
                    organizationScore: orgScore,
                    organizationObjectId: orgObjectId,
                    organizationPreferredLabel: orgPreferredLabel,
                    organizationalUnitCode: "",
                    organizationalUnitScore: 0,
                    organizationalUnitObjectId: "",
                    organizationalUnitPreferredLabel: "--",
                    remitText: "--",
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
            
                    if (!unit["remits"]) {
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
                            remitText: "--",
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

    onExportCSV(data: any[]) {
        // Define the CSV headers
        // const headers = ['Φορέας', 'Μονάδα', 'Αρμοδιότητα', 'Τύπος', 'ΦΕΚ', 'Στοιχεία', 'ΑΔΑ'];
        const headers = ['Φορέας', 'Μονάδα', 'Αρμοδιότητα', 'ΦΕΚ', 'Στοιχεία', 'ΑΔΑ'];
        const separator = ','; // CSV separator
      
        // Construct CSV content
        const csvContent = [
          headers.join(separator), // Add the headers
          ...data.flatMap((item) =>
            item.legalProvisionDetails.map((detail) => {
              const row = [
                `"${item.organizationPreferredLabel}"`, // Φορέας
                `"${item.organizationalUnitPreferredLabel}"`, // Μονάδα
                `"${item.remitText.replace(/[\r\n]+/g, ' ').replace(/"/g, '""')}"`, // Αρμοδιότητα (cleaned text)
                // `"${item.remitType}"`, // Τύπος
                `"${detail.legalActKey}"`, // ΦΕΚ
                `"${JSON.stringify(detail.legalProvisionSpecs).replace(/"/g, '""')}"`, // Στοιχεία (as JSON string)
                `"${detail.ada}"` // ΑΔΑ
              ];
              return row.join(separator); // Join row data with the separator
            })
          )
        ].join('\n');
      
        // Create a Blob for the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
      
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      
        // Revoke the URL to free memory
        URL.revokeObjectURL(url);
    }    
}
