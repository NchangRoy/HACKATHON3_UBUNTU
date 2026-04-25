/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Moderator = {
    id?: string;
    name?: string;
    email?: string;
    level?: Moderator.level;
    role?: string;
};
export namespace Moderator {
    export enum level {
        JUNIOR = 'junior',
        SENIOR = 'senior',
        ADMIN = 'admin',
    }
}

