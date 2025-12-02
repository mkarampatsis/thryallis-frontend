import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IOta } from '../interfaces/ota/ota.interface';

// For Excel Export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ISearch } from '../interfaces/search/search.interface';
import { IElasticResources } from '../interfaces/search/search-resources.interface';
import { Observable } from 'rxjs';

const APIPREFIX_OTA = `${environment.apiUrl}/ota`;

@Injectable({
  providedIn: 'root'
})
export class OtaService {
  http = inject(HttpClient);

  // OTA CRUD Operations
  getAllOta(): Observable<HttpResponse<IOta[]>> {
    return this.http.get<IOta[]>(APIPREFIX_OTA, { observe: 'response' });
  }

  getOtaByID(id: string): Observable<HttpResponse<IOta>> {
    const url = `${APIPREFIX_OTA}/${id}`;
    return this.http.get<IOta>(url, { observe: 'response' });
  }

  newOta(data: IOta): Observable<HttpResponse<{ message: string }>> {
    return this.http.post<{ message: string }>(APIPREFIX_OTA, data, { observe: 'response' });
  }

  deleteOtaById(id: string): Observable<HttpResponse<IOta>> {
    const url = `${APIPREFIX_OTA}/${id}`;
    return this.http.delete<IOta>(url, { observe: 'response' });
  }

  updateOta(data: IOta, OtaId: string): Observable<HttpResponse<{ message: string }>> {
    return this.http.put<{ message: string }>(`${APIPREFIX_OTA}/${OtaId}`, data, { observe: 'response' });
  }

  getUniqueOrganizationTypes(): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>(`${APIPREFIX_OTA}/organization-types`, { observe: 'response' });
  }

  
  onExportToExcelSearch(data: IElasticResources) {
    // Convert each array into worksheet
    const facilitiesSheet = data.facilities ? XLSX.utils.json_to_sheet(data.facilities) : [];
    const spacesSheet = data.spaces ? XLSX.utils.json_to_sheet(data.spaces) : []
    const equipmentSheet = data.equipment ? XLSX.utils.json_to_sheet(data.equipment) : [];

    // Create workbook and append sheets
    const workbook: XLSX.WorkBook = {
      Sheets: {
        Facilities: facilitiesSheet,
        Spaces: spacesSheet,
        Equipment: equipmentSheet,
      },
      SheetNames: ["Facilities", "Spaces", "Equipment"],
    };

    // Write file
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save file
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "exported_data.xlsx");
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
            totalCoveredArea: 0,
            names: []
          },
          spaces: { 
            total: 0, 
            byType: {}, 
            bySubtype: {}, 
            bySpace: {},       // non-auxiliary
            byAuxiliary: {}    // auxiliary only
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

      // Build facility name string
      const kaek = facility.kaek || "";
      const useStr = Array.isArray(facility.useOfFacility) ? facility.useOfFacility.join("-") : (facility.useOfFacility || "");
      const addr = facility.addressOfFacility || {};
      const addrStr = [addr.street, addr.number, addr.postcode, addr.area]
        .filter(Boolean)
        .join("_");

      const facilityName = [kaek, useStr, addrStr].filter(Boolean).join("_");
      result[org].facilities.names.push(facilityName);

      // ----- Spaces -----
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

        // Count by Space or byAuxiliary
        const useSpace = space.spaceUse?.space || "Unknown";
        if (space.auxiliarySpace) {
          result[org].spaces.byAuxiliary[useSpace] =
            (result[org].spaces.byAuxiliary[useSpace] || 0) + 1;
        } else {
          result[org].spaces.bySpace[useSpace] =
            (result[org].spaces.bySpace[useSpace] || 0) + 1;
        }

        // ----- Equipments -----
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



