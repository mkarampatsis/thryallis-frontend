import { IRemit } from "../remit/remit.interface"
import { ILegalProvision } from "../legal-provision/legal-provision.interface"

export interface ISearch {
    organizations: Organization[]
}
  
export interface Organization {
    score: number
    object_id: string
    preferredLabel: string
    code: string
    organizational_units: OrganizationalUnit[]
}
  
export interface OrganizationalUnit {
    score: number
    object_id: string
    code: string
    preferredLabel: string
    remit: Remit
}
  
export interface Remit {
    object_id: string
    remitText: string
}

export interface ISearchGridOutput {
    organizationCode: string;
    organizationScore: number;
    organizationObjectId: string;
    organizationPreferredLabel: string;
    organizationalUnitCode: string;
    organizationalUnitScore: number;
    organizationalUnitObjectId: string;
    organizationalUnitPreferredLabel: string;
    remitText: string;
    remitObjectId: string;
    remitScore: number;
  }

  export interface ISearchGridInput {
    organizations: {
        score: number;
        object_id: string;
        preferredLabel: string;
        code: string;
        organizational_units: {
          score: number;
          object_id: string;
          preferredLabel: string;
          code: string;
          remits: {
            score: number;
            object_id: string;
            remitText: string;
          }[] | null;
        }[] | null;
      }[];
  } 

export interface OrganizationNode {
    expandable: boolean;
    monada: { preferredLabel: string; code: string };
    level: number;
    remitsFinalized: boolean;
    remits: IRemit[];
    provisions: ILegalProvision[]
    children?: OrganizationNode[]; // Store child elements dynamically
}