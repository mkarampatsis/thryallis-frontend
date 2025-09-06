import { Component, inject, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from 'src/app/shared/services/resources.service';
import { IFacility, IFacilitySummary, } from 'src/app/shared/interfaces/facility/facility';
import { IOrganizationList } from 'src/app/shared/interfaces/organization';
import { IOrganizationUnitList } from 'src/app/shared/interfaces/organization-unit';

@Component({
  selector: 'app-facilities-compare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facilities-compare.component.html',
  styleUrl: './facilities-compare.component.css'
})
export class FacilitiesCompareComponent {
  @Input() organizationsToCompare: IOrganizationList[] = []
  @Input() organizationalUnitsToCompare: IOrganizationUnitList[] = []
  @Input() facilitiesToCompare: IFacility[] = []
  
  resourceService = inject(ResourcesService)

  summary: { [organization: string]: IFacilitySummary } = {};
  loading = false

  objectKeys = Object.keys;
  
  ngOnInit(){

    if (this.organizationsToCompare.length) {
      
      const codes = this.organizationsToCompare.map(node => node.code);
      this.loading = this.organizationsToCompare.length ? true: false;
      
      this.resourceService.getFacilityDetailsByOrganizations(codes)
      .subscribe(response => {
        const body = response.body;
        const status = response.status;
        if (status === 200) {
          this.summary = this.resourceService.aggregateData(body);
          this.loading = false
        }
      });
    } else if (this.organizationalUnitsToCompare.length){

      const codes = this.organizationalUnitsToCompare.map(node => node.code);
      this.loading = this.organizationalUnitsToCompare.length ? true: false;

      this.resourceService.getFacilityDetailsByOrganizationalUnits(codes)
      .subscribe(response => {
        const body = response.body;
        const status = response.status;
        if (status === 200) {
          this.summary = this.resourceService.aggregateData(body);
          this.loading = false
        }
      })
    } else if (this.facilitiesToCompare.length) {
      
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
      });
    }
  }

  onExportToExcel() {
    this.resourceService.onExportToExcel(this.summary);
  }
}
