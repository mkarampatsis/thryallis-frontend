import { IRemit } from "../remit/remit.interface";

export interface IOrganizationTreeReport {
    expandable: boolean;
    monada: {
        preferredLabel: string;
        code: string;
    };
    level: number;
    remitsFinalized: boolean;
    remits: IRemit[]
}
