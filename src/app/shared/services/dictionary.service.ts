import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDictionaryType } from 'src/app/shared/interfaces/dictionary';
import { Observable } from 'rxjs';

const APIPREFIX = `${environment.apiUrl}/apografi/dictionary`;

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    http = inject(HttpClient);

    getAllOrganizationTypes(): Observable<IDictionaryType[]> {
        const url = `${APIPREFIX}/OrganizationTypes`;
        return this.http.get<IDictionaryType[]>(url);
    }

    getAllOrganizationUnitTypes(): Observable<IDictionaryType[]> {
        const url = `${APIPREFIX}/UnitTypes`;
        return this.http.get<IDictionaryType[]>(url);
    }
}
