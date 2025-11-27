import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IInstructionProvision } from 'src/app/shared/interfaces/instruction-provision/instruction-provision.interface';

const APIPREFIX = `${environment.apiUrl}/instruction_provision`;

@Injectable({
    providedIn: 'root',
})
export class InstructionProvisionService {
    http = inject(HttpClient);

    instructionProvisionsNeedUpdate = signal<boolean>(false);
    instructionProvisionObjectUpdate = signal<IInstructionProvision>(null);

    newInstructionProvision(data: IInstructionProvision): Observable<{ message: string; legalProvision: IInstructionProvision }> {
        return this.http.post<{ message: string; legalProvision: IInstructionProvision }>(APIPREFIX, data);
    }

    getAllInstructionProvisions(): Observable<IInstructionProvision[]> {
        return this.http.get<IInstructionProvision[]>(APIPREFIX);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX}/count`;
        return this.http.get<{ count: number }>(url);
    }

    getInstructionProvisionsByRegulatedOrganization(code: string): Observable<IInstructionProvision[]> {
        const url = `${APIPREFIX}/by_regulated_organization/${code}`;
        return this.http.get<IInstructionProvision[]>(url);
    }

    getInstructionProvisionsByRegulatedOrganizationUnit(code: string): Observable<IInstructionProvision[]> {
        const url = `${APIPREFIX}/by_regulated_organization_unit/${code}`;
        return this.http.get<IInstructionProvision[]>(url);
    }

    getInstructionProvisionsByRegulatedRemit(code: string): Observable<IInstructionProvision[]> {
        const url = `${APIPREFIX}/by_regulated_remit/${code}`;
        return this.http.get<IInstructionProvision[]>(url);
    }

    deleteInstructionProvision(legalProvisionID: string): Observable<{ message: string }> {
        const url = `${APIPREFIX}/${legalProvisionID}`;
        return this.http.delete<{ message: string }>(url);
    }

    updateInstructionProvision(
        provisionType: string,
        code: string,
        currentProvision: IInstructionProvision,
        updatedProvision: IInstructionProvision,
        remitID: string = null,
    ): Observable<{ message: string; updatedInstructionProvision: IInstructionProvision }> {
        const url = `${APIPREFIX}`;
        const data = { provisionType, code, currentProvision, updatedProvision, remitID };
        return this.http.put<{ message: string; updatedInstructionProvision: IInstructionProvision }>(url, data);
    }
}
