export interface IFloorPlans {
  level: string;
  num: number;
  floorArea: number;
  floorPlan: string
}

export interface IFacility {
  organization: {
    code: string;
    preferredLabel: string;
  };
  kaek:string,
  belongsTo: string,
  distinctiveNameOfFacility: string;
  useOfFacility: string;
  uniqueUserOfFacility: boolean;
  coveredPremisesArea: number;
  floors_levels:number;
  floorplans: IFloorPlans[];
  addressOfFacility: {
    street: string;
    number: number;
    postcode: string;
    area: string;
    municipality: string;
    geographicRegion: string;
    country: string;
  }
}

