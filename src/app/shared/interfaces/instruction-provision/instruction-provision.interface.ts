import { IInstructionProvisionSpecs } from './instruction-provision-specs.interface';
import { IReguLatedOtaObject } from './regulated-object.interface';

export interface IInstructionProvision {
    _id: string;
    regulatedObject?: IReguLatedOtaObject;
    instructionActKey: string;
    instructionProvisionSpecs: IInstructionProvisionSpecs;
    instructionProvisionText: string;
    isNew?: boolean;
}
