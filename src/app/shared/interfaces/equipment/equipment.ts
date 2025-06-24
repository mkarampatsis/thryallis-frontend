export interface IEquipement {
  organization: string;
  organizationCode: string;
  organizationalUnit: [{
    organizationalUnit: string;
    organizationalUnitCode: string;
  }]
  facilityId: string[];
  type: string;
  kind: string;
  category: string;
  values: [{
    value: string;
    description: string;
    info: string;
  }]
}