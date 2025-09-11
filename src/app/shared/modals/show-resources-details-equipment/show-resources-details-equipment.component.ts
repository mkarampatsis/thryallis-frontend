import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesService } from '../../services/resources.service';
import { IEquipment } from '../../interfaces/equipment/equipment';

@Component({
  selector: 'app-show-resources-details-equipment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-resources-details-equipment.component.html',
  styleUrl: './show-resources-details-equipment.component.css'
})
export class ShowResourcesDetailsEquipmentComponent implements OnInit {
resourceService = inject(ResourcesService);
  
  code: string;
  modalRef: any;
  data!: IEquipment;
  
  loading = false;

  ngOnInit(){
    this.loading = true;
    this.resourceService.getEquipmentDetailsById(this.code)
    .subscribe(response => {
      const body = response.body;          
      const status = response.status;        
      if (status === 200) {
        console.log(body);
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
