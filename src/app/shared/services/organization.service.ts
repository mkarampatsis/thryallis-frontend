import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IOrganizationCode } from 'src/app/shared/interfaces/dictionary';
import {
    IOrganizationList,
    IOrganization,
    IOrganizationTreeNode,
} from 'src/app/shared/interfaces/organization';
import { Observable } from 'rxjs';

const APIPREFIX_APOGRAFI = `${environment.apiUrl}/apografi/organization`;
const APIPREFIX_PSPED = `${environment.apiUrl}/psped/foreas`;

@Injectable({
    providedIn: 'root',
})
export class OrganizationService {
    http = inject(HttpClient);

    getAllOrganizationCodes(): Observable<IOrganizationCode[]> {
        const url = APIPREFIX_APOGRAFI;
        return this.http.get<IOrganizationCode[]>(url);
    }

    getAllOrganizations(): Observable<IOrganizationList[]> {
        const url = `${APIPREFIX_APOGRAFI}/all`;
        return this.http.get<IOrganizationList[]>(url);
    }

    getOrganizationDetails(code: string): Observable<IOrganization> {
        const url = `${APIPREFIX_APOGRAFI}/${code}`;
        return this.http.get<IOrganization>(url);
    }

    getOrganizationTree(code: string): Observable<IOrganizationTreeNode[]> {
        const url = `${APIPREFIX_PSPED}/${code}/tree`;
        return this.http.get<IOrganizationTreeNode[]>(url);
    }
}
