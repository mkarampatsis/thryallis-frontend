import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { IFacilityData, IFacility, IFacilitySummary, ISpace, ISpaceData } from '../interfaces/facility/facility';
import { IEquipmentConfig } from '../interfaces/equipment/equipmentConfig';
import { IFacilitySpace } from '../interfaces/facility/facility-space';
import { IEquipment } from '../interfaces/equipment/equipment';
import { IFacilityConfig } from '../interfaces/facility/facilityConfig';
import { IEmployee } from '../interfaces/employee/employee';

// For Excel Export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ISearch } from '../interfaces/search/search.interface';
import { IElasticResources } from '../interfaces/search/search-resources.interface';

const APIPREFIX_FACILITY = `${environment.apiUrl}/facility`;
const APIPREFIX_EQUIPMENT = `${environment.apiUrl}/equipment`;
const APIPREFIX_EMPLOYEE = `${environment.apiUrl}/employee`;

const APIPREFIX_RESOURCES = `${environment.elasticUrl}/search/resources`;

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

  // Employee Requests
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

  updateEmployee(data: IEmployee): Observable<HttpResponse<{ message: string }>> {
    const email = data.emailWork;
    return this.http.put<{ message: string }>(`${APIPREFIX_EMPLOYEE}/${email}`, data, { observe: 'response' });
  }

  deleteEmployee(email: string): Observable<HttpResponse<{ message: string }>> {
    return this.http.delete<{ message: string }>(`${APIPREFIX_EMPLOYEE}/${email}`, { observe: 'response' });
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

  getFacilityDetailsByOrganizationalUnits(codes: string[]): Observable<HttpResponse<[]>> {
    const url = `${APIPREFIX_FACILITY}/organizationalUnits/details`;
    return this.http.get<[]>(url, { params: { codes: codes.join(',') }, observe: 'response' });
  }

  getFacilityDetailsByFacilitiesID(codes: string[]): Observable<HttpResponse<[]>> {
    const url = `${APIPREFIX_FACILITY}/facilities/details`;
    return this.http.get<[]>(url, { params: { codes: codes.join(',') }, observe: 'response' });
  }

  getFacilityDetailsById(id: string): Observable<HttpResponse<IFacilityData>> {
    const url = `${APIPREFIX_FACILITY}/${id}/details`;
    return this.http.get<IFacilityData>(url, { observe: 'response' });
  }

  getSpaceDetailsById(id: string): Observable<HttpResponse<ISpaceData>> {
    const url = `${APIPREFIX_FACILITY}/space/${id}/details`;
    return this.http.get<ISpaceData>(url, { observe: 'response' });
  }

  getEquipmentDetailsById(id: string): Observable<HttpResponse<IEquipment>> {
    const url = `${APIPREFIX_EQUIPMENT}/${id}/details`;
    return this.http.get<IEquipment>(url, { observe: 'response' });
  }

  // Elastic Request
  postSearch(data: any): Observable<HttpResponse<any>> {
    return this.http.post<ISearch>(APIPREFIX_RESOURCES, data, { observe: 'response' });
  };

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

  onExportToExcel(jsonData: { [organization: string]: IFacilitySummary }): void {
    const data: any[] = [];

    // Flatten summary into rows
    for (const [org, orgData] of Object.entries(jsonData)) {
      if (org === "_TOTALS_") continue; // skip totals for now, handle later

      const facilityNames = orgData.facilities.names.join(", ");
      
      // Facilities
      data.push({
        Organization: org,
        Section: "Ακίνητα",
        Metric: "Σύνολο ακινήτων",
        Value: facilityNames || orgData.facilities.total,
      });
      data.push({
        Organization: org,
        Section: "Ακίνητα",
        Metric: "Συνολικό εμβαδόν ακινήτων",
        Value: orgData.facilities.totalCoveredArea,
      });
      for (const [use, count] of Object.entries(orgData.facilities.byUse)) {
        data.push({
          Organization: org,
          Section: "Ακίνητα",
          Metric: `Χρήση ακινήτου: ${use}`,
          Value: count,
        });
      }

      // Spaces
      data.push({
        Organization: org,
        Section: "Χώροι ακινήτου",
        Metric: "Συνολικοί χώροι ακινήτου",
        Value: orgData.spaces.total,
      });
      for (const [type, count] of Object.entries(orgData.spaces.byType)) {
        data.push({
          Organization: org,
          Section: "Χώροι ακινήτου",
          Metric: `Χρήση χώρου: ${type}`,
          Value: count,
        });
      }
      for (const [subtype, count] of Object.entries(orgData.spaces.bySubtype)) {
        data.push({
          Organization: org,
          Section: "Χώροι ακινήτου",
          Metric: `Υποτύπος χώρου: ${subtype}`,
          Value: count,
        });
      }
      for (const [space, count] of Object.entries(orgData.spaces.bySpace)) {
        data.push({
          Organization: org,
          Section: "Χώροι ακινήτου",
          Metric: `Χώρος: ${space}`,
          Value: count,
        });
      }
      data.push({
        Organization: org,
        Section: "Χώροι ακινήτου",
        Metric: "Βοηθητικοί χώροι",
        Value: orgData.spaces.byAuxiliary,
      });

      // Equipments
      data.push({
        Organization: org,
        Section: "Εξοπλισμός",
        Metric: "Σύνολο εξοπλισμού",
        Value: orgData.equipments.total,
      });
      
      for (const [cat, count] of Object.entries(orgData.equipments.byCategory)) {
        data.push({
          Organization: org,
          Section: "Εξοπλισμός",
          Metric: `Κατηγορία: ${cat}`,
          Value: count,
        });
      }
      for (const [sub, count] of Object.entries(orgData.equipments.bySubcategory)) {
        data.push({
          Organization: org,
          Section: "Εξοπλισμός",
          Metric: `Υποκατηγορία: ${sub}`,
          Value: count,
        });
      }
      for (const [kind, count] of Object.entries(orgData.equipments.byKind)) {
        data.push({
          Organization: org,
          Section: "Εξοπλισμός",
          Metric: `Είδος: ${kind}`,
          Value: count,
        });
      }
      for (const [type, count] of Object.entries(orgData.equipments.byType)) {
        data.push({
          Organization: org,
          Section: "Εξοπλισμός",
          Metric: `Τύπος: ${type}`,
          Value: count,
        });
      }
    }

    // Add Grand Totals (_TOTALS_)
    const totals = jsonData["_TOTALS_"];
    if (totals) {
      data.push({ Organization: "TOTALS", Section: "Ακίνητα", Metric: "Σύνολο ακινήτων", Value: totals.facilities.total });
      data.push({ Organization: "TOTALS", Section: "Ακίνητα", Metric: "Συνολικό εμβαδόν ακινήτων", Value: totals.facilities.totalCoveredArea });
      for (const [use, count] of Object.entries(totals.facilities.byUse)) {
        data.push({ Organization: "TOTALS", Section: "Ακίνητα", Metric: `Χρήση ακινήτου: ${use}`, Value: count });
      }

      data.push({ Organization: "TOTALS", Section: "Χώροι ακινήτου", Metric: "Συνολικοί χώροι ακινήτου", Value: totals.spaces.total });
      for (const [type, count] of Object.entries(totals.spaces.byType)) {
        data.push({ Organization: "TOTALS", Section: "Χώροι ακινήτου", Metric: `Χρήση χώρου: ${type}`, Value: count });
      }
      for (const [subtype, count] of Object.entries(totals.spaces.bySubtype)) {
        data.push({ Organization: "TOTALS", Section: "Χώροι ακινήτου", Metric: `Υποτύπος χώρου: ${subtype}`, Value: count });
      }
      for (const [space, count] of Object.entries(totals.spaces.bySpace)) {
        data.push({ Organization: "TOTALS", Section: "Χώροι ακινήτου", Metric: `Χώρος: ${space}`, Value: count });
      }
      data.push({ Organization: "TOTALS", Section: "Χώροι ακινήτου", Metric: "Βοηθητικοί χώροι", Value: totals.spaces.byAuxiliary });

      data.push({ Organization: "TOTALS", Section: "Εξοπλισμός", Metric: "Σύνολο εξοπλισμού", Value: totals.equipments.total });
      for (const [kind, count] of Object.entries(totals.equipments.byKind)) {
        data.push({ Organization: "TOTALS", Section: "Εξοπλισμός", Metric: `Είδος: ${kind}`, Value: count });
      }
      for (const [cat, count] of Object.entries(totals.equipments.byCategory)) {
        data.push({ Organization: "TOTALS", Section: "Εξοπλισμός", Metric: `Κατηγορία: ${cat}`, Value: count });
      }
      for (const [sub, count] of Object.entries(totals.equipments.bySubcategory)) {
        data.push({ Organization: "TOTALS", Section: "Εξοπλισμός", Metric: `Υποκατηγορία: ${sub}`, Value: count });
      }
      for (const [type, count] of Object.entries(totals.equipments.byType)) {
        data.push({ Organization: "TOTALS", Section: "Εξοπλισμός", Metric: `Τύπος: ${type}`, Value: count });
      }
    }

    // Convert to worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Στοιχεία Ακινήτων Φορέων');

    // Save to file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'facility-details.xlsx');
  }

  exportToExcelReport1(jsonData: any[]) {
    // 1. Facilities with spaces flattened
    const facilities: any[] = [];
    
    jsonData["facilities"].forEach(f => {
      if (f.spaces && f.spaces.length > 0) {
        f.spaces.forEach(space => {
          facilities.push({
            "Φορέας": f.organization,
            "Κωδ. Φορέα": f.organizationCode,
            "KAEK": f.kaek,
            "Διακριτή Ονομασία": f.distinctiveNameOfFacility,
            "Τύπος Χρήσης": f.useOfFacility,
            "Εμβαδόν σε τ.μ": f.coveredPremisesArea,
            "Όροφοι": f.floorsOrLevels,
            "Διεύθυνση": `${f.addressOfFacility.street} ${f.addressOfFacility.number}, ${f.addressOfFacility.postcode} ${f.addressOfFacility.area}, ${f.addressOfFacility.municipality}`,
            "Χώρα": f.addressOfFacility.country,
            // --- Space info ---
            "Ονομασία Χώρου": space.spaceName,
            "Τύπος Χώρου": space.spaceUse?.type || '',
            "Υποκατηγορία Χώρου": space.spaceUse?.subtype || '',
            "Χώρος": space.spaceUse?.space || '',
            "Εμβαδόν Χώρου": space.spaceArea,
            "Είσοδοι": space.entrances,
            "Παράθυρα": space.windows,
            "Όροφος/Επίπεδο": `${space.floorPlans?.level} ${space.floorPlans?.num || ''}`,
          });
        });
      } else {
        // Facility without spaces
        facilities.push({
          "Φορέας": f.organization,
          "Κωδ. Φορέα": f.organizationCode,
          "KAEK": f.kaek,
          "Διακριτή Ονομασία": f.distinctiveNameOfFacility,
          "Τύπος Χρήσης": f.useOfFacility,
          "Εμβαδόν σε τ.μ": f.coveredPremisesArea,
          "Όροφοι": f.floorsOrLevels,
          "Διεύθυνση": `${f.addressOfFacility.street} ${f.addressOfFacility.number}, ${f.addressOfFacility.postcode} ${f.addressOfFacility.area}, ${f.addressOfFacility.municipality}`,
          "Χώρα": f.addressOfFacility.country,
          "Ονομασία Χώρου": '',
          "Τύπος Χώρου": '',
          "Υποκατηγορία Χώρου": '',
          "Χώρος": '',
          "Εμβαδόν Χώρου": '',
          "Είσοδοι": '',
          "Παράθυρα": '',
          "Όροφος/Επίπεδο": '',
        });
      }
    });

    // 2. Equipment data stays as before
    const equipments = jsonData["equipments"].map(eq => ({
      "Κωδ. Εξοπλισμού": eq._id.$oid,
      "Φορέας": eq.organization,
      "Κωδ. Φορέα": eq.organizationCode,
      "Κωδ. Ακινήτου Φιλοξενίας": eq.hostingFacility.$oid,
      "Κωδ. Ακινήτων": eq.spaceWithinFacility.$oid,
      "Κατηγορία": eq.resourceCategory,
      "Υποκατηγορία": eq.resourceSubcategory,
      "Είδος": eq.kind,
      "Τύπος": eq.type,
      "Κατάσταση": eq.status,
      "Ημερ. Προμήθειας": new Date(eq.acquisitionDate.$date).toLocaleDateString(),
      "Χαρακτηριστικά": eq.itemDescription.map(d => `${d.description}: ${d.value}`).join(', '),
      "Ποσότητα": eq.itemQuantity.reduce((sum, q) => sum + q.quantity, 0)
    }));

    // 3. Create sheets
    const wsFacilities: XLSX.WorkSheet = XLSX.utils.json_to_sheet(facilities);
    const wsEquipments: XLSX.WorkSheet = XLSX.utils.json_to_sheet(equipments);

    // 4. Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsFacilities, 'Ακίνητα και Χώροι');
    XLSX.utils.book_append_sheet(wb, wsEquipments, 'Εξοπλισμός');

    // 5. Export
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'facilities_and_equipments.xlsx');
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



