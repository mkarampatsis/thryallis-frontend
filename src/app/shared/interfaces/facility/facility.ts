export interface IFloorPlans {
  level: string;
  num: string;
  floorArea: string;
  floorPlan: string[];
}

export interface IFacility {
  organization: string;
  organizationCode: string;
  kaek: string;
  belongsTo: string;
  distinctiveNameOfFacility: string;
  useOfFacility: string;
  uniqueUseOfFacility: string;
  coveredPremisesArea: string;
  floorsOrLevels: string;
  floorPlans: IFloorPlans[];
  addressOfFacility: {
    street: string;
    number: string;
    postcode: string;
    area: string;
    municipality: string;
    geographicRegion: string;
    country: string;
  }
  finalized: string;
}

export interface ISpace {
  facilityId: string;
  spaceName: string;
  organizationalUnit: { organizationalUnit: string; organizationalUnitCode: string}[]
  spaceUse: {
    type: string;
    subtype: string;
    space: string;
  };
  auxiliarySpace:boolean
  spaceArea: string;
  spaceLength: string;
  spaceWidth: string;
  entrances: string
  windows: string;
  floorPlans: {
    level: string;
    num: string;
  }
}