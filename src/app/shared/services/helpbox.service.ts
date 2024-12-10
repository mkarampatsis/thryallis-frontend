import { Injectable, inject } from '@angular/core';
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

  newQuestion(data: IHelpbox): Observable<{ msg: string; index: IHelpbox }> {
    console.log(APIPREFIX);
    return this.http.post<{ msg: string; index: IHelpbox }>(APIPREFIX, data);
  }
  
}
