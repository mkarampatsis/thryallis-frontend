export interface IEquipment {
  organization: string;
  organizationCode: string;
  hostingFacility: string;
  spaceWithinFacility: string;
  resourceCategory: string;
  resourceSubcategory: string;
  kind: string;
  type: string;
  itemDescription: { value: string; description: string; info: string }[],
  itemQuantity: { distinctiveNameOfFacility: string; facilityId: string; spaceName: string; spaceId: string; quantity:number; codes: string; }[],
  acquisitionDate: string;
  depreciationDate: string;
  status: string;
}