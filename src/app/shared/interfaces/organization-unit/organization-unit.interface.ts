import { IAddress } from '../organization/address.interface';
import { IPurpose } from '../organization/purpose.interface';
import { ISpatial } from './spatial.interface';

export interface IOrganizationUnit {
    code: string;
    organizationCode: string;
    supervisorUnitCode: string;
    preferredLabel: string;
    alternativeLabels: string[];
    purpose: IPurpose[];
    spatial: ISpatial[];
    identifier: string;
    unitType: number;
    description: string;
    email: string;
    telephone: string;
    url: string;
    mainAddress: IAddress;
    secondaryAddresses: IAddress[];
}
