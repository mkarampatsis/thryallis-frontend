import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IOrganizationUnitCode } from 'src/app/shared/interfaces/dictionary';
import { IOrganizationUnit, IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';
import { IOrganizationUnitPSPED } from '../interfaces/organization-unit/organizational-unit-psped.interface';

const APIPREFIX_APOGRAFI = `${environment.apiUrl}/apografi/organizationalUnit`;
const APIPREFIX_PSPED = `${environment.apiUrl}/psped`;

@Injectable({
    providedIn: 'root',
})
export class OrganizationalUnitService {
    http = inject(HttpClient);

    getAllOrganizationalUnitCodes(): Observable<IOrganizationUnitCode[]> {
        const url = `${APIPREFIX_APOGRAFI}`;
        return this.http.get<IOrganizationUnitCode[]>(url);
    }

    getAllOrganizationalUnits(): Observable<IOrganizationUnitList[]> {
        const url = `${APIPREFIX_APOGRAFI}/all`;
        return this.http.get<IOrganizationUnitList[]>(url);
    }

    getAllMonadesAggregate(): Observable<IOrganizationUnitList[]> {
        const url = `${APIPREFIX_PSPED}/monada/aggregate/all`;
        return this.http.get<IOrganizationUnitList[]>(url);
    }

    getOrganizationalUnitDetails(code: string): Observable<IOrganizationUnit> {
        const url = `${APIPREFIX_APOGRAFI}/${code}`;
        return this.http.get<IOrganizationUnit>(url);
    }

    getOrganizationalUnitOrganizationCode(code: string): Observable<string> {
        const url = `${APIPREFIX_APOGRAFI}/${code}/organizationCode`;
        return this.http.get<string>(url);
    }

    getMonadaPsped(code: string): Observable<IOrganizationUnitPSPED> {
        const url = `${APIPREFIX_PSPED}/monada/${code}`;
        return this.http.get<IOrganizationUnitPSPED>(url);
    }

    getAllMonadesPsped(): Observable<IOrganizationUnitPSPED[]> {
        const url = `${APIPREFIX_PSPED}/monada/all`;
        return this.http.get<IOrganizationUnitPSPED[]>(url);
    }

    finalizeRemits(code: string, status: boolean): Observable<{ message: string; remitsFinalized: boolean }> {
        const url = `${APIPREFIX_PSPED}/monada/${code}/finalize_remits`;
        return this.http.put<{ message: string; remitsFinalized: boolean }>(url, { status });
    }
}
