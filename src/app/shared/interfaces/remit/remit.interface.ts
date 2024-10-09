import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface IRemit {
    _id: string;
    // regulatedObject: {
    //     regulatedObjectType: 'remit';
    //     regulatedObjectCode: string;
    // };
    organizationalUnitCode: string;
    remitText: string;
    remitType: string;
    cofog: {
        cofog1: string;
        cofog2: string;
        cofog3: string;
    };
    status: string;
    legalProvisions: ILegalProvision[];
}
