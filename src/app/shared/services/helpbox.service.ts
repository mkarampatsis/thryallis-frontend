import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IHelpbox, IGeneralInfo } from '../interfaces/helpbox/helpbox.interface';

const APIPREFIX = `${environment.apiUrl}/helpbox`;

@Injectable({
  providedIn: 'root'
})
export class HelpboxService {

  http = inject(HttpClient);

  helpboxNeedUpdate = signal<boolean>(false);

  helpboxNewQuestion = signal(<IHelpbox | null>null);

  getAllHelpbox(): Observable<IHelpbox[]> {
    return this.http.get<IHelpbox[]>(APIPREFIX);
  }

  getAllPublishedHelpbox(): Observable<IHelpbox[]> {
    return this.http.get<IHelpbox[]>(`${APIPREFIX}/all/published`);
  }

  getHelpboxById(id:string): Observable<IHelpbox> {
    return this.http.get<IHelpbox>(`${APIPREFIX}/id/${id}`);
  }

  newQuestion(data: IHelpbox): Observable<{ msg: string; index: IHelpbox }> {
    return this.http.post<{ msg: string; index: IHelpbox }>(APIPREFIX, data);
  }

  updateQuestion(data: IHelpbox, id:string): Observable<{ msg: string; index: IHelpbox }> {
    return this.http.put<{ msg: string; index: IHelpbox }>(`${APIPREFIX}/${id}`, data);
  }

  answerQuestion(data: IHelpbox): Observable<{ msg: string; index: IHelpbox }> {
    return this.http.put<{ msg: string; index: IHelpbox }>(APIPREFIX, data);
  }

  finalizeHelpBoxById(data: {id:string, finalized:boolean}): Observable<{ msg: string; index: IHelpbox }> {
    return this.http.put<{ msg: string; index: IHelpbox }>(`${APIPREFIX}/finalize`, data);
  }

  publishHelpBoxById(data: {helpBoxId:string, questionId:string, published:boolean}): Observable<{ msg: string; index: IHelpbox }> {
    return this.http.put<{ msg: string; index: IHelpbox }>(`${APIPREFIX}/publish`, data);
  }

  getGeneralInfo(): Observable<IGeneralInfo[]> {
    return this.http.get<IGeneralInfo[]>(`${APIPREFIX}/general-info`);
  }

  newGeneralInfo(data: IGeneralInfo): Observable<{ msg: string; index: IHelpbox }> {
    return this.http.post<{ msg: string; index: IGeneralInfo }>(`${APIPREFIX}/general-info`, data);
  }

  deleteGeneralInfo(generalInfoID: string): Observable<{ message: string }> {
    const url = `${APIPREFIX}/general-info/${generalInfoID}`;
    return this.http.delete<{ message: string }>(`${APIPREFIX}/general-info/${generalInfoID}`);
  }

  deleteFileFromGeneralInfo(generalInfoID: string, fileId:string): Observable<{ message: string }> {
    const url = `${APIPREFIX}/general-info/${generalInfoID}`;
    return this.http.delete<{ message: string }>(`${APIPREFIX}/general-info/${generalInfoID}/file/${fileId}`);
  }

  downloadFile(fileContent: BlobPart, fileName: string, mimeType: string): void {
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    URL.revokeObjectURL(url);
  }
}
