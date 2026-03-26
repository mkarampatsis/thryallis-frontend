import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IForeas } from 'src/app/shared/interfaces/foreas/foreas.interface';
import { IOrganizationList } from 'src/app/shared/interfaces/organization/organization-list.interface';

const APIPREFIX_PSPED = `${environment.apiUrl}/psped`;
const APIPREFIX_SDAD = `${environment.apiUrl}/sdad`;

@Injectable({
  providedIn: 'root',
})
export class ForeasService {
  http = inject(HttpClient);

  getForeas(code: string): Observable<IForeas> {
    const url = `${APIPREFIX_PSPED}/foreas/${code}`;
    return this.http.get<IForeas>(url);
  }

  // From SDAD
  getAllForeisPagination(
    page: number,
    pageSize: number,
    filterModel: any,
    sortModel: any
  ): Observable<{ "rows": IOrganizationList[], "total": number }> {
    const params = {
      page: page,
      pageSize: pageSize,
      filter: JSON.stringify(filterModel),
      sort: JSON.stringify(sortModel)
    };

    const url = `${APIPREFIX_SDAD}/organization/all/pagination`;
    return this.http.get<{ "rows": IOrganizationList[], "total": number }>(url, { params })
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
