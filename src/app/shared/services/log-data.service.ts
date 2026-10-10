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
import { HtmlCellRenderer } from 'src/app/components/ota/search/search-grid/search-grid.component';
import { ColDef } from 'ag-grid-community';

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


    remitColDefs = [
      { field: 'what.key.organization', headerName: 'Φορέας', flex: 1 },
      { field: 'what.key.organizationalUnit', headerName: 'Μονάδα', flex: 1 },
      { field: 'what.key.code', headerName: 'Κωδικός Μονάδας', flex: 1 },
      { 
        field: 'action', 
        headerName: 
        'Διαδικασία', 
        flex: 1,
        valueGetter: (params) => {
          const type = (params.data.action === 'create') ? 'Δημιουργία' : (params.data.action === 'update') ? 'Ενημέρωση' : (params.data.action === 'delete') ? 'Διαγραφή' : params.data.action;
          return type;
        }, 
      },
      { field: 'who', headerName: 'Χρήστης', flex: 1, },
      { 
        field: 'when', 
        headerName: 'Ημερομηνία',
        valueGetter: (params) => {
          const date = new Date(params.data.when.$date).toLocaleDateString('el-GR');
          return date;
        },
        flex: 1 
      },
      // {
      //   field: 'when',
      //   headerName: 'Ημερομηνία',
      //   flex: 6,
      //   cellRenderer: HtmlCellRenderer,
      //   autoHeight: true,
      //   cellStyle: { 'white-space': 'normal' },
      // },
      // { field: 'who', headerName: 'Χρήστης', flex: 1 },
    ];

        
    getAllChangesByEntity(entity: string): Observable<any> {
        const url = `${APIPREFIX}/allChangesByEntity/${entity}`;
        return this.http.get<any>(url);
    }

    getAllEntityNames(): Observable<any> {
        const url = `${APIPREFIX}/allEntityNames`;
        return this.http.get<any>(url);
    }
    
    getChanges(code: string): Observable<ILog[]> {
        const url = `${APIPREFIX}/${code}`;
        return this.http.get<ILog[]>(url);
    }
}