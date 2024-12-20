import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IHelpbox } from '../interfaces/helpbox/helpbox.interface';

const APIPREFIX = `${environment.apiUrl}/helpbox`;

@Injectable({
  providedIn: 'root'
})
export class HelpboxService {

    http = inject(HttpClient);

    helpboxNeedUpdate = signal<boolean>(false);

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
}
