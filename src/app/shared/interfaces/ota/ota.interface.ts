import { ILegalProvision } from '../legal-provision/legal-provision.interface';

export interface IOta {
  _id: string;
  remitText: string;
  remitCompetence: string;
  legalProvisions: ILegalProvision[];
}