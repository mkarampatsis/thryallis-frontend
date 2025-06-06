export interface IFloorPlans {
  level: string;
  num: string;
  floorArea: string;
  floorPlan: string[];
}

export interface IFacility {
  organization: string;
  organizationCode: string;
  organizationalUnit: string;
  organizationalUnitCode: string;
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
  facilityID: string;
  spaceName: string;
  spaceUse: string;
  spaceUseTree: string[];
  spaceArea: number;
  spaceLength: string;
  spaceWidth: string;
  entrances: number;
  windows: number;
  floor_level: number;
}