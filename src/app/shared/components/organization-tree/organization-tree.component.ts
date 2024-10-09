import { ArrayDataSource } from '@angular/cdk/collections';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs';

import { IOrganizationTreeNode } from 'src/app/shared/interfaces/organization/organization-tree-node.interface';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ModalService } from '../../services/modal.service';

interface FlatNode extends IOrganizationTreeNode {
    isExpanded?: boolean;
}

@Component({
    selector: 'app-organization-tree',
    standalone: true,
    imports: [
        CdkTreeModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgbAlertModule,
        NgbTooltipModule,
    ],
    templateUrl: './organization-tree.component.html',
    styleUrl: './organization-tree.component.css',
})
export class OrganizationTreeComponent implements OnInit {
    @Input() organizationCode: string | null = null;
    organizationService = inject(OrganizationService);
    modalService = inject(ModalService);

    organizationTree: IOrganizationTreeNode[] | null = null;
    dataSource: ArrayDataSource<FlatNode> | null = null;
    treeControl = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable,
    );
    hasChild = (_: number, node: FlatNode) => node.expandable;

    isLoading = true;

    ngOnInit(): void {
        this.organizationService
            .getOrganizationTree(this.organizationCode)
            .pipe(take(1))
            .subscribe((data) => {
                this.organizationTree = data as FlatNode[];
                this.dataSource = new ArrayDataSource(this.organizationTree);
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
}
