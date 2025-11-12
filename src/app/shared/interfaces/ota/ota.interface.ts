import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface IOta {
    _id: string;
    remitText: string;
    remitCompetence: string;
    // remitType: string;
    // cofog: {
    //     cofog1: string;
    //     cofog2: string;
    //     cofog3: string;
    // };
    // status: string;
    legalProvisions: ILegalProvision[];
}