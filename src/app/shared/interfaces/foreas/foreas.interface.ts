import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface IForeas {
    code: string;
    level: string;
    provisionText: string;
    legalProvisions: ILegalProvision[];
}
