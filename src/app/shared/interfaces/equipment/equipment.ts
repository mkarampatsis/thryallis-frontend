export interface IEquipment {
  organization: string;
  organizationCode: string;
  spaceId: string[];
  type: string;
  kind: string;
  category: string;
  values: [{
    value: string;
    description: string;
    info: string;
  }]
}