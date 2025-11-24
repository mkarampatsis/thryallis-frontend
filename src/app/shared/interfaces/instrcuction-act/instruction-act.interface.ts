import { IFek } from './fek.interface';

export interface IInstructionAct {
    _id: { $oid: string };
    ada: string;
    fek: IFek;
    InstructionActKey: string;
    InstructionActFile: { $oid: string };
    InstructionActNumber: string;
    InstructionActType: string;
    InstructionActTypeOther: string;
    InstructionActDateOrYear: string;
}
