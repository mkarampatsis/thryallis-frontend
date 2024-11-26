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
    remitlegalActKey: string;
    remitLegalProvisionSpecs: {
      meros:  string;
      arthro:  string;
      paragrafos: string;
      edafio: string;
      pararthma: string;
    },
    remitAda: string;
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