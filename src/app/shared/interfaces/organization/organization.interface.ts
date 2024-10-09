import { IAddress } from './address.interface';
import { IContactPoint } from './contact-point.interface';
import { IOrganizationType } from './organization-type';
import { IPurpose } from './purpose.interface';
import { ISubOrganizationOf } from './sub-organization.interface';

export interface IOrganization {
    code: string;
    preferredLabel: string;
    alternativeLabels: string[];
    purpose: IPurpose[];
    subOrganizationOf: ISubOrganizationOf;
    organizationType: IOrganizationType;
    url: string;
    contactPoint: IContactPoint;
    vatId: string;
    status: string;
    mainDataUpdateDate: string;
    organizationStructureUpdateDate: string;
    mainAddress: IAddress;
    secondaryAddresses: IAddress[];
}
