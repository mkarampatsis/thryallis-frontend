import { CommonModule } from '@angular/common';
import { ArrayDataSource } from '@angular/cdk/collections';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit, SimpleChanges, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, map, switchMap, take } from 'rxjs';

import { IOrganizationTreeReport } from 'src/app/shared/interfaces/organization/organization-tree-report.interface';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ModalService } from '../../services/modal.service';
import { RemitService } from '../../services/remit.service';
import { IRemit } from '../../interfaces/remit/remit.interface';
import { ShowTreeReportComponent } from './show-tree-report/show-tree-report.component';
import { OrganizationNode } from '../../interfaces/search/search.interface';
import { SearchService } from '../../services/search.service';

interface FlatNode extends IOrganizationTreeReport {
    isExpanded?: boolean;
}

@Component({
    selector: 'app-organization-tree-report',
    standalone: true,
    imports: [
        CommonModule,
        CdkTreeModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgbAlertModule,
        NgbTooltipModule,
        ShowTreeReportComponent
    ],
    templateUrl: './organization-tree-report.component.html',
    styleUrl: './organization-tree-report.component.css'
})
export class OrganizationTreeReportComponent implements OnInit {
    @Input() organizationCode: string | null = null;
    @Input() organizationName: string | null = null;
    @Input() code: string | null = null;

    organizationService = inject(OrganizationService);
    modalService = inject(ModalService);
    remitService = inject(RemitService)
    searchService = inject(SearchService)

    remits: IRemit[] = []

    organizationTree: IOrganizationTreeReport[] | null = null;
    hierarchicalData: OrganizationNode[] = [];

    isLoading = true;

    ngOnInit(): void {
        console.log("1>>>", this.organizationCode, this.code)
        
        this.organizationService
        .getOrganizationTree(this.organizationCode)
        .pipe(
            take(1),
            switchMap((data: FlatNode[]) => {
            // this.organizationTree = data; // Save the organization tree
            this.organizationTree = this.getSubTree(data, this.code);
            console.log(">>",this.organizationTree);
            const remitRequests = this.organizationTree.map(node =>
                this.remitService.getRemitsByCode(node.monada.code).pipe(
                map(remits => ({ ...node, remits })) // Add remits to each node
                )
            );
            return forkJoin(remitRequests); // Wait for all requests to complete
            })
        )
        .subscribe(updatedTree => {
            this.organizationTree = updatedTree; // Update the tree with remits
            this.hierarchicalData = this.buildHierarchy(this.organizationTree);
            this.isLoading = false;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['organizationCode'] || changes['code']) {
            console.log("CH1>>>",changes['organizationCode'], changes['code'])
            console.log("CH2>>>",this.organizationCode, this.code);
        }
    }
    
    buildHierarchy(flatList: OrganizationNode[]): OrganizationNode[] {
        const rootNodes: OrganizationNode[] = [];
        const stack: OrganizationNode[] = [];
    
        for (const node of flatList) {
          node.children = []; // Ensure every node has a `children` array
    
          while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
            stack.pop(); // Move up the hierarchy if needed
          }
    
          if (stack.length > 0) {
            stack[stack.length - 1].children!.push(node); // Add child to the last element in stack
          } else {
            rootNodes.push(node); // If no parent, it's a root node
          }
    
          if (node.expandable) {
            stack.push(node); // Push expandable nodes to stack
          }
        }
    
        return rootNodes;
    }

    getRemits(code: string){
        this.remitService.getRemitsByCode(code)
            .subscribe(data => {
                this.remits = data;
                console.log(this.remits);
                return this.remits;
            })
    }

    onBtnExportExcel(){
        this.searchService.onExportToExcelReport(this.hierarchicalData)
    }

    getSubTree(flatTree: any[], code: string): any[] {
        // Find the root node of the subtree
        const rootNode = flatTree.find(node => node.monada.code === code);
        if (!rootNode) {
            console.warn("Node not found");
            return [];
        }
    
        const subtree: any[] = [rootNode];
        const rootLevel = rootNode.level;
        
        // Start collecting children
        for (let i = flatTree.indexOf(rootNode) + 1; i < flatTree.length; i++) {
            const currentNode = flatTree[i];
    
            // Stop when reaching a node at the same or lower level as the root
            if (currentNode.level <= rootLevel) {
                break;
            }
    
            // Add to subtree if it's a child
            subtree.push(currentNode);
        }
    
        return subtree;
    }
}
