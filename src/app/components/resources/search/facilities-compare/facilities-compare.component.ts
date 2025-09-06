import { Component, inject, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { IFacility, IFacilitySummary, } from 'src/app/shared/interfaces/facility/facility';

@Component({
  selector: 'app-facilities-compare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facilities-compare.component.html',
  styleUrl: './facilities-compare.component.css'
})
export class FacilitiesCompareComponent {
  @Input() facilitiesToCompare: IFacility[] = []
  resourceService = inject(ResourcesService)

  summary: { [organization: string]: IFacilitySummary } = {};
  loading = false

  objectKeys = Object.keys;
  
  ngOnInit(){
    const codes = this.facilitiesToCompare.map(node => node._id["$oid"]);
    
    this.loading = this.facilitiesToCompare.length ? true: false;

    this.resourceService.getFacilityDetailsByFacilitiesID(codes)
    .subscribe(response => {
      const body = response.body;
      const status = response.status;
      if (status === 200) {
        this.summary = this.resourceService.aggregateData(body);
        this.loading = false;
      }
    })
  }

  onExportToExcel() {
    this.resourceService.onExportToExcel(this.summary);
  }
}
