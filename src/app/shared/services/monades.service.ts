import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IMonada } from '../interfaces/monada/monada.interface';

const APIPREFIX_APOGRAFI = `${environment.apiUrl}/apografi`;
const APIPREFIX_PSPED = `${environment.apiUrl}/psped`;

@Injectable({
    providedIn: 'root',
})
export class MonadesService {
    http = inject(HttpClient);

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX_APOGRAFI}/organizationalUnit/count`;
        return this.http.get<{ count: number }>(url);
    }

    getMonada(code: string): Observable<IMonada> {
        const url = `${APIPREFIX_PSPED}/monada/${code}`;
        return this.http.get<IMonada>(url);
    }

    updateMonada(data: IMonada): Observable<IMonada> {
        const url = `${APIPREFIX_PSPED}/organizationalUnit/${data.code}`;
        return this.http.put<IMonada>(url, data);
    }
}
