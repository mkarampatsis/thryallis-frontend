import { IAddress } from '../organization/address.interface';
import { IPurpose } from '../organization/purpose.interface';
import { ISpatial } from './spatial.interface';
import { IOrganizationCode } from '../organization/organization-code.interface';
import { ISubOrganizationOf } from '../organization/sub-organization.interface';
import { IUnitType } from './unit-type.interface';

export interface IOrganizationUnit_Sdad {
  code: string;
  organizationCode: IOrganizationCode;
  supervisorUnitCode: ISubOrganizationOf;
  preferredLabel: string;
  alternativeLabels: string[];
  purpose: IPurpose[];
  spatial: ISpatial[];
  identifier: string;
  unitType: IUnitType;
  description: string;
  email: string;
  telephone: string;
  url: string;
  mainAddress: IAddress;
  secondaryAddresses: IAddress[];
  remitsFinalized: boolean;
}
