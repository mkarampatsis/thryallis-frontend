import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IForeas } from 'src/app/shared/interfaces/foreas/foreas.interface';

const APIPREFIX_PSPED = `${environment.apiUrl}/psped`;

@Injectable({
    providedIn: 'root',
})
export class ForeasService {
    http = inject(HttpClient);

    getForeas(code: string): Observable<IForeas> {
        const url = `${APIPREFIX_PSPED}/foreas/${code}`;
        return this.http.get<IForeas>(url);
    }

    updateForeas(data: IForeas): Observable<IForeas> {
        const url = `${APIPREFIX_PSPED}/organization/${data.code}`;
        return this.http.put<IForeas>(url, data);
    }

    count(): Observable<{ count: number }> {
        const url = `${APIPREFIX_PSPED}/foreas/count`;
        return this.http.get<{ count: number }>(url);
    }
}
