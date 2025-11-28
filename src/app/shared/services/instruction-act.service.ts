import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IInstructionAct } from '../interfaces/instruction-act/instruction-act.interface';

const APIPREFIX = `${environment.apiUrl}/instruction_act`;

@Injectable({
    providedIn: 'root',
})
export class InstructionActService {
    http = inject(HttpClient);

    instructionActsNeedUpdate = signal<boolean>(false);

    newInstructionAct(data: IInstructionAct): Observable<IInstructionAct> {
        return this.http.post<IInstructionAct>(APIPREFIX, data);
    }

    updateInstructionAct(id: string, data: IInstructionAct): Observable<IInstructionAct> {
        return this.http.put<IInstructionAct>(`${APIPREFIX}/${id}`, data);
    }

    getAllInstructionActs(): Observable<IInstructionAct[]> {
        return this.http.get<IInstructionAct[]>(APIPREFIX);
    }

    getInstructionActById(id: string): Observable<IInstructionAct> {
        const url = `${APIPREFIX}/by-id/${id}`;
        return this.http.get<IInstructionAct>(url);
    }

    getInstructionsActByActKey(id: string): Observable<IInstructionAct> {
        const encodedId = encodeURIComponent(id);
        const url = `${APIPREFIX}/by-act-key/${encodedId}`;
        return this.http.get<IInstructionAct>(url);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX}/count`;
        return this.http.get<{ count: number }>(url);
    }
}
