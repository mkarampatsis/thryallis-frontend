export interface IOrganizationTreeNode {
    expandable: boolean;
    monada: {
        preferredLabel: string;
        code: string;
    };
    level: number;
}
