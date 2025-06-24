export interface IEquipement {
  organization: string;
  organizationCode: string;
  space: string[];
  type: string;
  kind: string;
  category: string;
  values: [{
    value: string;
    description: string;
    info: string;
  }]
}