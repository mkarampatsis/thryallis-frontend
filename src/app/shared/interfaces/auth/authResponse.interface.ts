import { IUser } from './user.interface';

export interface IAuthResponse {
    accessToken: string;
    user: IUser;
}
