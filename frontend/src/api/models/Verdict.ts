/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Verdict = {
    id?: string;
    claim_id?: string;
    status?: Verdict.status;
    confidence_score?: number;
    summary?: string;
};
export namespace Verdict {
    export enum status {
        TRUE = 'True',
        FALSE = 'False',
        PROBABLY_TRUE = 'ProbablyTrue',
        CONTESTED = 'Contested',
        UNVERIFIABLE = 'Unverifiable',
    }
}

