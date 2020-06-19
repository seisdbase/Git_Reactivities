//Interfaces for user login and register, what comes back from server

export interface IUser {
    username: string;
    displayName: string;
    token: string;
    image?: string;
}

export interface IUserFormValues {
    email: string;
    password: string;
    displayName?: string;
    username?: string;
}