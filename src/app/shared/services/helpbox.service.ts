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

    getHelpboxById(id:string): Observable<IHelpbox> {
        return this.http.get<IHelpbox>(`${APIPREFIX}/id/${id}`);
    }

    getAllHelpboxNotFinalized(): Observable<IHelpbox[]> {
        return this.http.get<IHelpbox[]>(`${APIPREFIX}/not-finalized`);
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
  
}
