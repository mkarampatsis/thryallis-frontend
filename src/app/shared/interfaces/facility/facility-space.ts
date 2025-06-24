export interface IFacilitySpace {
  organization: string
  organizationCode: string
  organizationalUnit: string
  organizationalUnitCode: string
  distinctiveNameOfFacility: string
  useOfFacility: string
  spaces: Spaces
}

export interface Spaces {
  _id: Id
  createdAt: CreatedAt
  updatedAt: UpdatedAt
  facilityId: FacilityId
  spaceName: string
  spaceUse: SpaceUse
  spaceArea: string
  spaceLength: string
  spaceWidth: string
  entrances: string
  windows: string
  floorPlans: FloorPlans
  elasticSync: boolean
}

export interface Id {
  $oid: string
}

export interface CreatedAt {
  $date: string
}

export interface UpdatedAt {
  $date: string
}

export interface FacilityId {
  $oid: string
}

export interface SpaceUse {
  type: string
  subtype: string
  space: string
}

export interface FloorPlans {
  level: string
  num: string
}
