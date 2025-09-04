import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from '../../services/resources.service';
import { FacilityData } from '../../interfaces/facility/facility';


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
  data!: FacilityData; 

  ngOnInit(){
    this.resourceService.getFacilityDetailsById(this.code)
    .subscribe(response => {
      const body = response.body;          
      const status = response.status;        
      if (status === 200) {
        this.data = body;
        console.log(body);
      }
    })
  }

  getItemDescriptionString(eq: any): string {
    return eq.itemDescription
      ?.map((d: any) => `${d.description}=${d.value}`)
      .join(', ') || '';
  }
}
