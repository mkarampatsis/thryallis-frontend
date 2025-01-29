import { CommonModule } from '@angular/common';
import { ArrayDataSource } from '@angular/cdk/collections';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, map, switchMap, take } from 'rxjs';

import { IOrganizationTreeNode } from 'src/app/shared/interfaces/organization/organization-tree-node.interface';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ModalService } from '../../services/modal.service';
import { RemitService } from '../../services/remit.service';
import { IRemit } from '../../interfaces/remit/remit.interface';

interface FlatNode extends IOrganizationTreeNode {
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
        NgbTooltipModule
    ],
    templateUrl: './organization-tree-report.component.html',
    styleUrl: './organization-tree-report.component.css'
})
export class OrganizationTreeReportComponent implements OnInit {
    @Input() organizationCode: string | null = null;
    @Input() code: string | null = null;

    organizationService = inject(OrganizationService);
    modalService = inject(ModalService);
    remitService = inject(RemitService)

    remits: IRemit[] = []

    organizationTree: IOrganizationTreeNode[] | null = null;

    isLoading = true;

    ngOnInit(): void {
        console.log(">>>", this.organizationCode, this.code)
        // this.organizationService
        //     .getOrganizationTree(this.organizationCode)
        //     .pipe(take(1))
        //     .subscribe((data) => {
        //         this.organizationTree = data as FlatNode[];
        //         this.organizationTree.forEach(data=>{

        //         })
        //         console.log(this.organizationTree)
        //         this.isLoading = false;
        //     });
        this.organizationService
        .getOrganizationTree(this.organizationCode)
        .pipe(
            take(1),
            switchMap((data: FlatNode[]) => {
            this.organizationTree = data; // Save the organization tree
            const remitRequests = data.map(node =>
                this.remitService.getRemitsByCode(node.monada.code).pipe(
                map(remits => ({ ...node, remits })) // Add remits to each node
                )
            );
            return forkJoin(remitRequests); // Wait for all requests to complete
            })
        )
        .subscribe(updatedTree => {
            this.organizationTree = updatedTree; // Update the tree with remits
            console.log(this.organizationTree);
            this.isLoading = false;
        });
    }

    getParentNode(node: FlatNode): FlatNode | null {
        const nodeIndex = this.organizationTree.indexOf(node);

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (this.organizationTree[i].level === node.level - 1) {
                return this.organizationTree[i];
            }
        }

        return null;
    }

    shouldRender(node: FlatNode) {
        let parent = this.getParentNode(node);
        while (parent) {
            if (!parent.isExpanded) {
                return false;
            }
            parent = this.getParentNode(parent);
        }
        return true;
    }

    showOrganizationUnitDetails(code: string): void {
        this.modalService.showOrganizationUnitDetails(code);
    }

    editMonada(code: string) {
        // console.log('editMonada >>>>>>>>>>>>>>>>', code);
        this.modalService.monadaEdit(code);
    }

    getRemits(code: string){
        this.remitService.getRemitsByCode(code)
            .subscribe(data => {
                this.remits = data;
                console.log(this.remits);
                return this.remits;
            })
    }
}
