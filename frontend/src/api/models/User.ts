/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: User.role;
    /**
     * Crédibilité (1-5)
     */
    priority?: number;
    createdAt?: string;
};
export namespace User {
    export enum role {
        INDIVIDUAL = 'individual',
        ORGANIZATION = 'organization',
    }
}

