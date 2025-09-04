import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { FacilityData, IFacility, ISpace } from '../interfaces/facility/facility';
import { IEquipmentConfig } from '../interfaces/equipment/equipmentConfig';
import { IFacilitySpace } from '../interfaces/facility/facility-space';
import { IEquipment } from '../interfaces/equipment/equipment';
import { IFacilityConfig } from '../interfaces/facility/facilityConfig';
import { IEmployee } from '../interfaces/employee/employee';

// For Excel Export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const APIPREFIX_FACILITY = `${environment.apiUrl}/facility`;
const APIPREFIX_EQUIPMENT = `${environment.apiUrl}/equipment`;
const APIPREFIX_EMPLOYEE = `${environment.apiUrl}/employee`;

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

  getFacilitiesByListOfOrganizationCodes(codes: string[]): Observable<HttpResponse<IFacility[]>> {
    const url = `${APIPREFIX_FACILITY}/organizations`;
    return this.http.get<IFacility[]>(url, { params: { codes: codes.join(',') }, observe: 'response' });
  }

  newFacility(data: IFacility): Observable<HttpResponse<{ message: string }>> {
    return this.http.post<{ message: string }>(APIPREFIX_FACILITY, data, { observe: 'response' });
  }

  deleteFacilityById(id: string): Observable<HttpResponse<IFacility>> {
    const url = `${APIPREFIX_FACILITY}/${id}`;
    return this.http.delete<IFacility>(url, { observe: 'response' });
  }

  updateFacilty(data: IFacility, facilityId: string): Observable<HttpResponse<{ message: string }>> {
    return this.http.put<{ message: string }>(`${APIPREFIX_FACILITY}/${facilityId}`, data, { observe: 'response' });
  }

  getFacilityCategories(): Observable<IFacilityConfig[]> {
    const url = `${APIPREFIX_FACILITY}/config`;
    return this.http.get<IFacilityConfig[]>(url);
  }

  createFacilitiesCategories(data: IFacilityConfig[]): Observable<HttpResponse<{ message: string }>> {
    const url = `${APIPREFIX_FACILITY}/config`;
    return this.http.post<{ message: string }>(url, data, { observe: 'response' });
  }

  updateFacilitiesCategories(data: IFacilityConfig[]): Observable<HttpResponse<{ message: string }>> {
    const url = `${APIPREFIX_FACILITY}/config`;
    return this.http.put<{ message: string }>(`${url}`, data, { observe: 'response' });
  }

  // FACILITY SPACE
  addSpace(data: ISpace): Observable<HttpResponse<{ message: string }>> {
    const facilityId = data.facilityId
    return this.http.post<{ message: string }>(`${APIPREFIX_FACILITY}/${facilityId}/space`, data, { observe: 'response' });
  }

  modifySpace(data: ISpace): Observable<HttpResponse<{ message: string }>> {
    const facilityId = data.facilityId
    return this.http.put<{ message: string }>(`${APIPREFIX_FACILITY}/${facilityId}/space`, data, { observe: 'response' });
  }

  getSpacesByFacilityId(id: string): Observable<HttpResponse<ISpace[]>> {
    const url = `${APIPREFIX_FACILITY}/${id}/spaces`;
    return this.http.get<ISpace[]>(url, { observe: 'response' });
  }

  getSpacesByOrganizationCode(code: string): Observable<HttpResponse<IFacilitySpace[]>> {
    const url = `${APIPREFIX_FACILITY}/organization/${code}/spaces`;
    return this.http.get<IFacilitySpace[]>(url, { observe: 'response' });
  }

  deleteSpaceById(id: string): Observable<HttpResponse<ISpace>> {
    const url = `${APIPREFIX_FACILITY}/space/${id}`;
    return this.http.delete<ISpace>(url, { observe: 'response' });
  }

  // EQUIPMENT 
  getEquipmentCategories(): Observable<IEquipmentConfig[]> {
    const url = `${APIPREFIX_EQUIPMENT}/config`;
    return this.http.get<IEquipmentConfig[]>(url);
  }

  createEquipmentCategories(data: IEquipmentConfig[]): Observable<HttpResponse<{ message: string }>> {
    const url = `${APIPREFIX_EQUIPMENT}/config`;
    return this.http.post<{ message: string }>(url, data, { observe: 'response' });
  }

  updateEquipmentCategories(data: IEquipmentConfig[]): Observable<HttpResponse<{ message: string }>> {
    const url = `${APIPREFIX_EQUIPMENT}/config`;
    return this.http.put<{ message: string }>(`${url}`, data, { observe: 'response' });
  }

  getEquipmentsByOrganizationCode(code: string): Observable<HttpResponse<IEquipment[]>> {
    const url = `${APIPREFIX_EQUIPMENT}/organization/${code}`;
    return this.http.get<IEquipment[]>(url, { observe: 'response' });
  }

  addEquipment(data: IEquipment[]): Observable<HttpResponse<{ message: string }>> {
    return this.http.post<{ message: string }>(`${APIPREFIX_EQUIPMENT}`, data, { observe: 'response' });
  }

  modifyEquipment(data: IEquipment): Observable<HttpResponse<{ message: string }>> {
    return this.http.put<{ message: string }>(`${APIPREFIX_EQUIPMENT}`, data, { observe: 'response' });
  }

  deleteEquipmentById(id: string): Observable<HttpResponse<IEquipment>> {
    const url = `${APIPREFIX_EQUIPMENT}/${id}`;
    return this.http.delete<IEquipment>(url, { observe: 'response' });
  }

  // Employee Requeasts
  getAllEmployess(): Observable<IEmployee[]> {
    return this.http.get<IEmployee[]>(APIPREFIX_EMPLOYEE);
  }

  getEmployeeByID(id: string): Observable<HttpResponse<IEmployee>> {
    const url = `${APIPREFIX_EMPLOYEE}/${id}`;
    return this.http.get<IEmployee>(url, { observe: 'response' });
  }

  getEmployessByOrganizationCode(code: string): Observable<HttpResponse<IEmployee[]>> {
    const url = `${APIPREFIX_EMPLOYEE}/organization/${code}`;
    return this.http.get<IEmployee[]>(url, { observe: 'response' });
  }

  newEmployee(data: IEmployee): Observable<HttpResponse<{ message: string }>> {
    return this.http.post<{ message: string }>(APIPREFIX_EMPLOYEE, data, { observe: 'response' });
  }

  // General Requests
  deleteFile(fileId: string): Observable<HttpResponse<{ message: string }>> {
    const url = `${APIPREFIX_FACILITY}/file/${fileId}`;
    return this.http.delete<{ message: string }>(url, { observe: 'response' });
  }

  getReportForOrganization_1(codes: string[]): Observable<HttpResponse<[]>> {
    const url = `${APIPREFIX_FACILITY}/report1`;
    return this.http.get<[]>(url, { params: { codes: codes.join(',') }, observe: 'response' });
  }

  getFacilityDetailsByOrganizations(codes: string[]): Observable<HttpResponse<[]>> {
    const url = `${APIPREFIX_FACILITY}/organizations/details`;
    return this.http.get<[]>(url, { params: { codes: codes.join(',') }, observe: 'response' });
  }

  getFacilityDetailsById(id: string): Observable<HttpResponse<FacilityData>> {
    const url = `${APIPREFIX_FACILITY}/${id}/details`;
    return this.http.get<FacilityData>(url, { observe: 'response' });
  }

  // Excel Export
  onExportToExcelMatrix1(jsonData: any[]): void {
    const data: any[] = [];

    // Add organization units legal provisions data
    jsonData.forEach(node => {
      data.push({
        'ΦΟΡΕΑΣ': node.organization,
        'ΑΚΙΝΗΤΟ': node.kaek+"_"+node.addressOfFacility.street+"_"+node.addressOfFacility.number+"_"+node.addressOfFacility.postcode+"_"+node.addressOfFacility.municipality,
        'ΔΙΑΚΡΙΤΗ ΟΝΟΜΑΣΙΑ': node.distinctiveNameOfFacility,
        'ΧΡΗΣΗ ΑΚΙΝΗΤΟΥ': node.useOfFacility,
        'ΣΥΝΟΛΙΚΟΣ ΣΤΕΓΑΣΜΕΝΟΣ ΧΩΡΟΣ (τ.μ)': node.coveredPremisesArea,
        'ΑΡΙΘΜΟΣ ΟΡΟΦΩΝ/ΕΠΙΠΕΔΩΝ': node.floorsOrLevels
      });
    });

    // Create a new worksheet and workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ακίνητα');

    // Save the file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Facility.xlsx');
  }

  aggregateData(docs: any[]) {
    const result: any = {};

    docs.forEach(facility => {
      const org = facility.organization;

      if (!result[org]) {
        result[org] = {
          facilities: {
            total: 0,
            byUse: {},
            coveredAreas: [],
            totalCoveredArea: 0
          },
          spaces: { 
            total: 0, 
            byType: {}, 
            bySubtype: {}, 
            bySpace: {}, 
            byAuxiliary: 0 
          },
          equipments: {
            total: 0,
            byKind: {},
            byCategory: {},
            bySubcategory: {},
            byType: {},
          }
        };
      }

      // ----- Facilities -----
      result[org].facilities.total += 1;
      result[org].facilities.coveredAreas.push(+facility.coveredPremisesArea || 0);
      result[org].facilities.totalCoveredArea += (+facility.coveredPremisesArea || 0);

      const use = facility.useOfFacility;
      result[org].facilities.byUse[use] = (result[org].facilities.byUse[use] || 0) + 1;

      facility.spaces.forEach((space: any) => {
        result[org].spaces.total += 1;

        // Count by Type
        const useType = space.spaceUse?.type || "Unknown";
        result[org].spaces.byType[useType] =
          (result[org].spaces.byType[useType] || 0) + 1;

        // Count by Subtype
        const useSubtype = space.spaceUse?.subtype || "Unknown";
        result[org].spaces.bySubtype[useSubtype] =
          (result[org].spaces.bySubtype[useSubtype] || 0) + 1;

        // Count by Space
        const useSpace = space.spaceUse?.space || "Unknown";
        result[org].spaces.bySpace[useSpace] =
          (result[org].spaces.bySpace[useSpace] || 0) + 1;

        // Count Auxiliary
        if (space.auxiliarySpace) {
          result[org].spaces.byAuxiliary += 1;
        }

        // Equipments
        space.equipments.forEach((eq: any) => {
          result[org].equipments.total += 1;

          const kind = eq.kind || "Unknown";
          result[org].equipments.byKind[kind] =
            (result[org].equipments.byKind[kind] || 0) + 1;

          const category = eq.resourceCategory || "Unknown";
          result[org].equipments.byCategory[category] =
            (result[org].equipments.byCategory[category] || 0) + 1;

          const subcategory = eq.resourceSubcategory || "Unknown";
          result[org].equipments.bySubcategory[subcategory] =
            (result[org].equipments.bySubcategory[subcategory] || 0) + 1;

          const type = eq.type || "Unknown";
          result[org].equipments.byType[type] =
            (result[org].equipments.byType[type] || 0) + 1;
        });
      });
    });

    return result;
  }
}



