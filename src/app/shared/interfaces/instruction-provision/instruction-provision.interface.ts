import { IInstructionProvisionSpecs } from './instruction-provision-specs.interface';
import { IReguLatedOtaObject } from './regulated-object.interface';

export interface IInstructionProvision {
    _id: string;
    instructionActKey: string;
    instructionProvisionSpecs: IInstructionProvisionSpecs;
    instructionProvisionText: string;
    instructionPages?: {
        from: string;
        to: string;
    };
    isNew?: boolean;
}

// export interface IInstructionProvisionGroup {
//   instructionActKey: string;
//   items: IInstructionProvisionItem[];
// }

// export interface IInstructionProvisionItem {
//   instructionProvisionSpecs: IInstructionProvisionSpecs;
//   instructionProvisionText: string;
//   instructionPages?: {
//     from?: string;
//     to?: string;
//   };
// }