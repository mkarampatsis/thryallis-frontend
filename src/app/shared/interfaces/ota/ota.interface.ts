import { ILegalProvision } from '../legal-provision/legal-provision.interface';
import { IInstructionProvision } from '../instruction-provision/instruction-provision.interface';

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
    cofog1_name: string;
    cofog2_name: string;
    cofog3_name: string;  
  };
  legalProvisions: ILegalProvision[];
  instructionProvisions: IInstructionProvision[];
  publicPolicyAgency: PublicPolicyAgency;
  status: string;
  finalized: boolean;
}

export interface IOtaSearch {
  remitText: string;
  remitCompetence: string;
  remitType: string;
  cofog1: string;
  cofog2: string;
  cofog3: string;
  publicPolicyAgency: {
    organization: string;
    organizationType: string;
  };
  remitLocalOrGlobal: string;
}