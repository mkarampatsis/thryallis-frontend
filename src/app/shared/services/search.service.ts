import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const APIPREFIX = `${environment.elasticUrl}/search`;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
    http = inject(HttpClient)

    postSearch(data:any): Observable<any> {
        return this.http.post<{data:any}>(APIPREFIX, data);
    }
}
