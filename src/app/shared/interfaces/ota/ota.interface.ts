import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface PublicPolicyAgency {
  organization: string;
  organizationCode: string;
  organizationType: string;
​​  status: string;
  subOrganizationOf: string;
  subOrganizationOfCode: string;
}

export interface IOta {
  _id: string;
  remitText: string;
  remitCompetence: string;
  remitType: string;
  remitLocalOrGlobal: string;
  cofog: {
    cofog1: string;
    cofog2: string;
    cofog3: string;
  };
  legalProvisions: ILegalProvision[];
  instructionProvisions: ILegalProvision[];
  publicPolicyAgency: PublicPolicyAgency;
}