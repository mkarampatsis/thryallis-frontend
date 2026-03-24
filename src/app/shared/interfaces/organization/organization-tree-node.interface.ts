export interface IOrganizationTreeNode {
    expandable: boolean;
    monada: {
        preferredLabel: string;
        code: string;
    };
    level: number;
}

export interface IOrganizationTreeSdadNode {
  code: string;
  preferredLabel: string;
  unitType?: number;
  expandable: boolean;
  level: number;
}