import { ILegalProvisionSpecs } from './legal-provision-specs.interface';
import { IReguLatedObject } from './regulated-object.interface';

export interface ILegalProvision {
    _id: string;
    regulatedObject?: IReguLatedObject;
    legalActKey: string;
    legalProvisionSpecs: ILegalProvisionSpecs;
    legalProvisionText: string;
    isNew?: boolean;
}
