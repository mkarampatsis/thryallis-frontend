export interface IOrganizationList {
    code: string;
    preferredLabel: string;
    subOrganizationOf: string;
    organizationType: number | string;
    status: string;
}
