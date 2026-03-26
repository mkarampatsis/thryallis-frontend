import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface IRemit {
    _id: string;
    // regulatedObject: {
    //     regulatedObjectType: 'remit';
    //     regulatedObjectCode: string;
    // };
    organization: {
      code: string;
      preferredLabel: string
    },
    organizational_unit:{
      code: string;
      preferredLabel: string
    },
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
