import { IManager } from "@/models/Manager";

export type IPublicManager = Omit<IManager, 'password' | 'comparePassword'>;
export interface ILogin {
    email: string;
    password: string;

}