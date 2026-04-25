/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Evidence = {
    id?: string;
    type?: Evidence.type;
    file_url?: string;
    t_event?: string;
    t_observation?: string;
    t_upload?: string;
    hash_file?: string;
    metadata?: Record<string, any>;
    rumor_id?: string;
    uploaded_by?: string;
};
export namespace Evidence {
    export enum type {
        VIDEO = 'video',
        AUDIO = 'audio',
        TEXT = 'text',
        IMAGE = 'image',
    }
}

