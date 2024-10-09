import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICofog } from 'src/app/shared/interfaces/cofog/cofog.interface';

const APIPREFIX = `${environment.apiUrl}/cofog`;

@Injectable({
    providedIn: 'root',
})
export class CofogService {
    http = inject(HttpClient);

    getCofog() {
        const url = `${APIPREFIX}`;
        return this.http.get<ICofog[]>(url);
    }
}
