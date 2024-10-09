export interface IUserRole {
    role: string;
    active: boolean;
    foreas: string[];
    monades: string[];
}

export interface IUser {
    googleId: string;
    provider: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    photoUrl: string;
    roles: IUserRole[];
}
