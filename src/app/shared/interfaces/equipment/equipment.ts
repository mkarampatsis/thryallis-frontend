export interface IEquipment {
  organization: string;
  organizationCode: string;
  spaceWithinFacility: string[];
  resourceCategory: string;
  resourcesubcategory: string;
  kind: string;
  type: string;
  itemDescription: [{
    value: string;
    description: string;
    info: string;
  }],
  acquisitionDate: string;
  depreciationDate: string;
  status: string;
}