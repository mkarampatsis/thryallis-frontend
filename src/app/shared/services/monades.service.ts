import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IMonada } from '../interfaces/monada/monada.interface';
import { IOrganizationUnitList } from '../interfaces/organization-unit';

const APIPREFIX_APOGRAFI = `${environment.apiUrl}/apografi`;
const APIPREFIX_PSPED = `${environment.apiUrl}/psped`;

@Injectable({
    providedIn: 'root',
})
export class MonadesService {
    http = inject(HttpClient);

    private cache = new Map<string, any>();

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

    getAllMonadesPagination(
        page: number,
        pageSize: number,
        filterModel: any,
        sortModel: any
    ): Observable<{"rows": IOrganizationUnitList[], "total": number}> {
        const params = {
            page: page,
            pageSize: pageSize,
            filter: JSON.stringify(filterModel),
            sort: JSON.stringify(sortModel)
        };

        const url = `${APIPREFIX_APOGRAFI}/organizationalUnit/all/pagination`;
        return this.http.get<{"rows": IOrganizationUnitList[], "total": number}>(url, { params })
    }

}
