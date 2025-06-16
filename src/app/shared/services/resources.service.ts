import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IFacility, ISpace } from '../interfaces/facility/facility';
import { IEquipmentCongif } from '../interfaces/equipment/equipmentConfig';

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

  getFacilityByID(id: string): Observable<HttpResponse<IFacility>> {
    const url = `${APIPREFIX_FACILITY}/${id}`;
    return this.http.get<IFacility>(url, { observe: 'response' });
  }

  getFacilitiesByOrganizationCode(code: string): Observable<HttpResponse<IFacility[]>> {
    const url = `${APIPREFIX_FACILITY}/organization/${code}`;
    return this.http.get<IFacility[]>(url, { observe: 'response' });
  }

  newFacility(data: IFacility): Observable<HttpResponse<{ message: string }>> {
    return this.http.post<{ message: string }>(APIPREFIX_FACILITY , data, { observe: 'response' });
  }

  deleteFacilityById(id:string): Observable<HttpResponse<IFacility>> {
    const url = `${APIPREFIX_FACILITY}/${id}`;
    return this.http.delete<IFacility>(url, { observe: 'response' });
  }

  // FACILITY SPACE
  addSpace(data: ISpace): Observable<HttpResponse<{ message: string }>> {
    const facilityId = data.facilityId
    return this.http.post<{ message: string }>(`${APIPREFIX_FACILITY}/${facilityId}/space` , data, { observe: 'response' });
  }

  getSpacesByFacilityId(id: string): Observable<HttpResponse<ISpace[]>> {
    const url = `${APIPREFIX_FACILITY}/${id}/space`;
    return this.http.get<ISpace[]>(url, { observe: 'response' });
  }

  deleteSpaceById(id:string): Observable<HttpResponse<ISpace>> {
    const url = `${APIPREFIX_FACILITY}/space/${id}`;
    return this.http.delete<ISpace>(url, { observe: 'response' });
  }

  // EQUIPMENT 
  equipmentCategories(): Observable<IEquipmentCongif[]> {
    const url = `${APIPREFIX_EQUIPMENT}/config`;
    return this.http.get<IEquipmentCongif[]>(url);
  }
}
