import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from '../../services/resources.service';
import { IFacilityData } from '../../interfaces/facility/facility';


@Component({
  selector: 'app-show-resources-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-resources-details.component.html',
  styleUrl: './show-resources-details.component.css'
})

export class ShowResourcesDetailsComponent implements OnInit {
  resourceService = inject(ResourcesService);
  
  code: string;
  modalRef: any;
  data!: IFacilityData;
  
  loading = false;

  ngOnInit(){
    this.loading = true;
    this.resourceService.getFacilityDetailsById(this.code)
    .subscribe(response => {
      const body = response.body;          
      const status = response.status;        
      if (status === 200) {
        // console.log(body);
        this.data = body;
        this.loading = false
      }
    })
  }

  getItemDescriptionString(eq: any): string {
    return eq.itemDescription
      ?.map((d: any) => `${d.description}=${d.value}`)
      .join(', ') || '';
  }
}
