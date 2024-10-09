import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface IMonada {
    code: string;
    provisionText: string;
    legalProvisions: ILegalProvision[];
}
