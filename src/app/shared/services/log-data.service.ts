import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ConstService } from 'src/app/shared/services/const.service';
import { Observable } from 'rxjs'
import { ILog } from '../interfaces/log/log.interface';
import { IRemit } from 'src/app/shared/interfaces/remit/remit.interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

const APIPREFIX = `${environment.apiUrl}/change`;

export interface IRemitExtended extends IRemit {
    organizationLabel: string;
    organizationUnitLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogDataService {
    http = inject(HttpClient);
    organizationService = inject(OrganizationService);
    userService = inject(UserService);
    constService = inject(ConstService);
        
    getAllChangesCodesByType(): Observable<any> {
        const url = `${APIPREFIX}/allChangesCodesByType`;
        return this.http.get<any>(url);
    }
    
    getChanges(code: string): Observable<ILog[]> {
        const url = `${APIPREFIX}/${code}`;
        return this.http.get<ILog[]>(url);
    }
}