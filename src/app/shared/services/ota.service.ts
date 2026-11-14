import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IOta } from '../interfaces/ota/ota.interface';
import { ModalService } from 'src/app/shared/services/modal.service';

// For Excel Export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ISearch } from '../interfaces/search/search.interface';
import { IElasticResources } from '../interfaces/search/search-resources.interface';
import { Observable, take } from 'rxjs';
import { ISearchOTA_Output } from '../interfaces/ota/searchOta.interface';

const APIPREFIX_OTA = `${environment.apiUrl}/ota`;
const APIPREFIX_ELASTIC = `${environment.elasticUrl}/search/ota`;

@Injectable({
  providedIn: 'root'
})
export class OtaService {
  http = inject(HttpClient);
  modalService = inject(ModalService);

  otaActsNeedUpdate = signal<boolean>(false);
  
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

  getFekFromAssets() {
    this.http.get("/assets/ota/fek_103a.pdf", { responseType: "blob" })
    .pipe(take(1))
    .subscribe((pdfBlob) => {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "document.pdf";
      this.modalService.showPdfViewer(link);
    });
  }

  // Elastic Request
  postSearch(data: any): Observable<HttpResponse<any>> {
    return this.http.post<ISearch>(APIPREFIX_ELASTIC, data, { observe: 'response' });
  };
  
  
  onExportToExcel(remits: ISearchOTA_Output[]) {
      const data: any[] = [];
  
      // Add organization units legal provisions data
      remits.forEach(node => {
        data.push({
          'Φορέας άσκησης αρμοδιότητας': node.remitCompetence,
          'Τύπος αρμοδιότητας': node.remitType,
          'Αυτοδιοικητική Αρμοδιότητα/Κρατική': node.remitLocalOrGlobal,
          'Φορέας Δημόσιας Πολιτικής': node.publicPolicyAgency_organization,
          'Τύπος Φορέα Δημόσιας Πολιτικής': node.publicPolicyAgency_organizationType
        });
      });
  
      // Create a new worksheet and workbook
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Αρμοδιότητες');
  
      // Save the file
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Remits.xlsx');
    }
}



