import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IFacility } from '../interfaces/facility/facility';

const APIPREFIX_FACILITY = `${environment.apiUrl}/facility`;
const APIPREFIX_EQUIPMENT = `${environment.apiUrl}/equipment`;

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  http = inject(HttpClient);

  // FACILITIES
  getAllFacilities(): Observable<IFacility[]> {
    return this.http.get<IFacility[]>(APIPREFIX_FACILITY);
  }

  getFacilityByID(id: string): Observable<IFacility> {
    const url = `${APIPREFIX_FACILITY}/${id}`;
    return this.http.get<IFacility>(url);
  }

  getFacilitiesByOrganizationCode(code: string): Observable<IFacility[]> {
    const url = `${APIPREFIX_FACILITY}/${code}`;
    return this.http.get<IFacility[]>(url);
  }

  newFacility(data: IFacility): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(APIPREFIX_FACILITY, data);
  }
}
