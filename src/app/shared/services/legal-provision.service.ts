import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ILegalProvision } from 'src/app/shared/interfaces/legal-provision/legal-provision.interface';
import { ILegalProvisionSpecs } from '../interfaces/legal-provision/legal-provision-specs.interface';
import { IReguLatedObject } from '../interfaces/legal-provision/regulated-object.interface';

const APIPREFIX = `${environment.apiUrl}/legal_provision`;

@Injectable({
    providedIn: 'root',
})
export class LegalProvisionService {
    http = inject(HttpClient);

    legalProvisionsNeedUpdate = signal<boolean>(false);

    newLegalProvision(data: ILegalProvision): Observable<{ message: string; legalProvision: ILegalProvision }> {
        return this.http.post<{ message: string; legalProvision: ILegalProvision }>(APIPREFIX, data);
    }

    getAllLegalProvisions(): Observable<ILegalProvision[]> {
        return this.http.get<ILegalProvision[]>(APIPREFIX);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX}/count`;
        return this.http.get<{ count: number }>(url);
    }

    getLegalProvisionsByRegulatedOrganization(code: string): Observable<ILegalProvision[]> {
        const url = `${APIPREFIX}/by_regulated_organization/${code}`;
        return this.http.get<ILegalProvision[]>(url);
    }

    getLegalProvisionsByRegulatedOrganizationUnit(code: string): Observable<ILegalProvision[]> {
        const url = `${APIPREFIX}/by_regulated_organization_unit/${code}`;
        return this.http.get<ILegalProvision[]>(url);
    }

    getLegalProvisionsByRegulatedRemit(code: string): Observable<ILegalProvision[]> {
        const url = `${APIPREFIX}/by_regulated_remit/${code}`;
        return this.http.get<ILegalProvision[]>(url);
    }

    deleteLegalProvision(legalProvisionID: string): Observable<{ message: string }> {
        const url = `${APIPREFIX}/${legalProvisionID}`;
        return this.http.delete<{ message: string }>(url);
    }

    updateLegalProvision(
        provisionType: string,
        code: string,
        currentProvision: ILegalProvision,
        updatedProvision: ILegalProvision,
        remitID: string = null,
    ): Observable<{ message: string; updatedLegalProvision: ILegalProvision }> {
        const url = `${APIPREFIX}`;
        const data = { provisionType, code, currentProvision, updatedProvision, remitID };
        return this.http.put<{ message: string; updatedLegalProvision: ILegalProvision }>(url, data);
    }
}
