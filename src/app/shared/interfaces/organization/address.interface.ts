import { IAdminUnit } from './admin-unit.interface';

export interface IAddress {
    fullAddress: string;
    postCode: string;
    adminUnitLevel1: IAdminUnit;
    adminUnitLevel2: IAdminUnit;
}
