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

export interface ISearchGrid {
    organizationCode: string
    organizationScore: number
    organizationObjectId: string
    organizationPreferredLabel: string
    organizationalUnitCode: string
    organizationalUnitScore: string
    organizationalUnitObjectId: string
    organizationalUnitPreferredLabel: string
    remitRemitText: string
    remitObjectId: string
  }