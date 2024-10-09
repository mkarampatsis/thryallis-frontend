import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IRemit } from '../interfaces/remit/remit.interface';

const APIPREFIX = `${environment.apiUrl}/remit`;

@Injectable({
    providedIn: 'root',
})
export class RemitService {
    http = inject(HttpClient);

    remitsNeedUpdate = signal<boolean>(false);

    newRemit(data: IRemit): Observable<{ msg: string; index: IRemit }> {
        return this.http.post<{ msg: string; index: IRemit }>(APIPREFIX, data);
    }

    updateRemit(data: IRemit): Observable<{ msg: string; index: IRemit }> {
        return this.http.put<{ msg: string; index: IRemit }>(APIPREFIX, data);
    }

    getAllRemits(): Observable<IRemit[]> {
        return this.http.get<IRemit[]>(APIPREFIX);
    }

    getRemitsByCode(code: string): Observable<IRemit[]> {
        const url = `${APIPREFIX}/by_code/${code}`;
        return this.http.get<IRemit[]>(url);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX}/count`;
        return this.http.get<{ count: number }>(url);
    }

    changeStatus(id: string, status: string): Observable<{ msg: string }> {
        const url = `${APIPREFIX}/status/${id}`;
        return this.http.put<{ msg: string }>(url, { status });
    }
}
