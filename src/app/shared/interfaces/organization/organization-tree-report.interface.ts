import { IRemit } from "../remit/remit.interface";
import { ILegalProvision } from "../legal-provision/legal-provision.interface";

export interface IOrganizationTreeReport {
    expandable: boolean;
    monada: {
        preferredLabel: string;
        code: string;
    };
    level: number;
    remitsFinalized: boolean;
    remits: IRemit[]
    provisions: ILegalProvision[]
}
