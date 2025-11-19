interface IFaclitityElastic {
  addressOfFacility: string;
  ​​​distinctiveNameOfFacility: string;
  kaek: string;
  object_id: string;
  score: number;
  useOfFacility: string;
  organization:string;
}

export interface ISpaceElastic {
  facilityId: string;
  object_id: string;
  score: number;
  spaceArea: number;
  spaceName: string;
  spaceUse: string;
  addressOfFacility?: string;
  distinctiveNameOfFacility?: string;
  kaek?: string;
}

export interface IEquipmentElastic {
  itemDescription: string;
  kind: string;
  object_id: string;
  organization: string;
  organizationCode: string;
  score: number;
  spaceWithinFacility: string[];
}

export interface IElasticResources {
  facilities: IFaclitityElastic[];
  spaces: ISpaceElastic[];
  equipment: IEquipmentElastic[];
}