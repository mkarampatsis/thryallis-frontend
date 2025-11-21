import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface PublicPolicyAgency {
  organization: string;
  organizationCode: string;
  organizationalUnit: string;
  organizationalUnitCode: string;
  unitType: string;
  subOrganizationOf: string;
  supervisorUnitCode: string;
}

export interface IOta {
  _id: string;
  remitText: string;
  remitCompetence: string;
  remitType: string;
  remitLocalOrGlobal: string;
  legalProvisions: ILegalProvision[];
  instructionProvisions: ILegalProvision[];
  publicPolicyAgency: PublicPolicyAgency;
}