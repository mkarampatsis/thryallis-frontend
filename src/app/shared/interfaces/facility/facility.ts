export interface IFloorPlans {
  level: string;
  num: string;
  floorArea: string;
  floorPlan: string[];
}

export interface IFacility {
  _id?: string;
  organization: string;
  organizationCode: string;
  kaek: string;
  belongsTo: string;
  distinctiveNameOfFacility: string;
  useOfFacility: string;
  uniqueUseOfFacility: boolean;
  private: boolean;
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
  finalized: boolean;
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

export interface IFacilityData {
  facility: {
    distinctiveNameOfFacility: string;
    organization: string;
    kaek: string;
    belongsTo: string;
    floorsOrLevels: number;
    useOfFacility: string
    addressOfFacility: {
      street: string;
      number: string;
      postcode: string;
      area: string;
      municipality: string;
      geographicRegion: string;
      country: string;
    };
  };
  spaces: Array<{
    spaceName: string;
    spaceUse: { type: string; space: string; };
    spaceArea: string;
    spaceLength: string;
    spaceWidth: string;
    entrances: string;
    windows: string;
    organizationalUnit: Array<{ organizationalUnit: string; organizationalUnitCode: string; }>;
    equipments: Array<any>;
  }>;
}

export interface IFacilitySummary {
  facilities: {
    names: string[];
    total: number;
    byUse: { [useOfFacility: string]: number };
    coveredAreas: { [kaek: string]: number };
    totalCoveredArea: number;
  };
  spaces: {
    total: number;
    byAuxiliary: number;
    byType: { [type: string]: number }; 
    bySubtype: { [subtype: string]: number }; 
    bySpace: { [space: string]: number };
  };
  equipments: {
    total: number;
    byKind: { [kind: string]: number };
    byCategory: { [category: string]: number };
    bySubcategory: { [subcategory: string]: number };
    byType: { [type: string]: number };
  };
}