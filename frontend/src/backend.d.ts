import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Expense {
    id: bigint;
    title: string;
    description: string;
    timestamp: Time;
    category: string;
    price: number;
}
export interface UserProfile {
    name: string;
}
export interface Summary {
    categoryBreakdown: Array<[string, number]>;
    expenseCount: bigint;
    lowestExpense?: number;
    totalExpense: number;
    highestExpense?: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addExpense(title: string, description: string, price: number, category: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteExpense(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpenses(): Promise<Array<Expense>>;
    getSummary(): Promise<Summary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
