import { ArrayDataSource } from '@angular/cdk/collections';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { IOrganizationTreeSdadNode } from 'src/app/shared/interfaces/organization/organization-tree-node.interface';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';

interface FlatSdadNode extends IOrganizationTreeSdadNode {
  isExpanded?: boolean;
}

@Component({
  selector: 'app-organization-tree-sdad',
  standalone: true,
  imports: [
    CdkTreeModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgbAlertModule,
    NgbTooltipModule
],
  templateUrl: './organization-tree-sdad.component.html',
  styleUrl: './organization-tree-sdad.component.css'
})
export class OrganizationTreeSdadComponent implements OnInit {
  @Input() code!: string;

  organizationService = inject(OrganizationService);
  modalService = inject(ModalService);
  authService = inject(AuthService);

  user = this.authService.user;

  sdadTree: FlatSdadNode[] = [];
  dataSource: ArrayDataSource<FlatSdadNode> | null = null;

  treeControl = new FlatTreeControl<FlatSdadNode>(
    node => node.level,
    node => node.expandable
  );

  hasChild = (_: number, node: FlatSdadNode) => node.expandable;

  isLoading = true;

  ngOnInit(): void {
    this.organizationService.getTreeSdad(this.code)
      .subscribe(flat => {
        this.sdadTree = flat;
        this.dataSource = new ArrayDataSource(flat);
        this.isLoading = false;
      });
  }

  getParentNode(node: FlatSdadNode): FlatSdadNode | null {
    const index = this.sdadTree.indexOf(node);
    for (let i = index - 1; i >= 0; i--) {
      if (this.sdadTree[i].level === node.level - 1) {
        return this.sdadTree[i];
      }
    }
    return null;
  }

  shouldRender(node: FlatSdadNode): boolean {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!parent.isExpanded) return false;
      parent = this.getParentNode(parent);
    }
    return true;
  }

  canEdit(code: string) {
    if (this.user()) {
      return this.authService.canEdit(code);
    }
    return true;
  }

  showOrganizationUnitDetails(code: string) {
    this.modalService.showOrganizationUnitDetails(code);
  }

  editMonada(code: string) {
    this.modalService.monadaEdit(code);
  }
}
