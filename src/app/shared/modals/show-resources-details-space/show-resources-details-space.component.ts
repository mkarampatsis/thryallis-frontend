import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from '../../services/resources.service';
import { ISpaceData } from '../../interfaces/facility/facility';

@Component({
  selector: 'app-show-resources-details-space',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-resources-details-space.component.html',
  styleUrl: './show-resources-details-space.component.css'
})
export class ShowResourcesDetailsSpaceComponent implements OnInit {
  resourceService = inject(ResourcesService);
  
  code: string;
  modalRef: any;
  data!: ISpaceData;
  
  loading = false;

  ngOnInit(){
    this.loading = true;
    this.resourceService.getSpaceDetailsById(this.code)
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
