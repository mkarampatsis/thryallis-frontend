import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ILegalAct } from 'src/app/shared/interfaces/legal-act/legal-act.interface';

const APIPREFIX = `${environment.apiUrl}/legal_act`;

@Injectable({
    providedIn: 'root',
})
export class LegalActService {
    http = inject(HttpClient);

    legalActsNeedUpdate = signal<boolean>(false);

    newLegalAct(data: ILegalAct): Observable<ILegalAct> {
        return this.http.post<ILegalAct>(APIPREFIX, data);
    }

    updateLegalAct(id: string, data: ILegalAct): Observable<ILegalAct> {
        return this.http.put<ILegalAct>(`${APIPREFIX}/${id}`, data);
    }

    getAllLegalActs(): Observable<ILegalAct[]> {
        return this.http.get<ILegalAct[]>(APIPREFIX);
    }

    getLegalActById(id: string): Observable<ILegalAct> {
        const url = `${APIPREFIX}/by-id/${id}`;
        return this.http.get<ILegalAct>(url);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX}/count`;
        return this.http.get<{ count: number }>(url);
    }
}
