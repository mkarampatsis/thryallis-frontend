import { IFek } from './fek.interface';

export interface ILegalAct {
    _id: { $oid: string };
    ada: string;
    fek: IFek;
    legalActKey: string;
    legalActFile: { $oid: string };
    legalActNumber: string;
    legalActType: string;
    legalActTypeOther: string;
    legalActDateOrYear: string;
}
