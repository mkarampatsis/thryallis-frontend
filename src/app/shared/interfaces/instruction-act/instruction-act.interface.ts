import { IFek } from './fek.interface';

export interface IInstructionAct {
    _id: { $oid: string };
    ada: string;
    fek: IFek;
    instructionActKey: string;
    instructionActFile: { $oid: string };
    instructionActNumber: string;
    instructionActType: string;
    instructionActTypeOther: string;
    instructionActDate: string;
}
