export interface ISearch {
    organizations: Organization[]
    organizational_units: OrganizationalUnit[]
    remits: Remit[]
}

export interface Organization {
    score: number
    object_id: string
    preferredLabel: string
}

export interface OrganizationalUnit {
    score: number
    object_id: string
    preferredLabel: string
}

export interface Remit {
    score: number
    object_id: string
    preferredLabel: any
}