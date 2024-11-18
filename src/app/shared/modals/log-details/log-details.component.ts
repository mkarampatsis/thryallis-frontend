import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Observable } from 'rxjs';
import { ILog } from '../../interfaces/log/log.interface';
import { LogDataService } from '../../services/log-data.service';
// import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-log-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-details.component.html',
  styleUrl: './log-details.component.css'
})
export class LogDetailsComponent {
    logDataService = inject(LogDataService)

    modalRef: any;
    code: string

    results: ILog[];

    ngOnInit() : void {
        this.logDataService.getChanges(this.code)
        .subscribe((data)=>{
            console.log(data)
            this.results = data
        })
    }
}
