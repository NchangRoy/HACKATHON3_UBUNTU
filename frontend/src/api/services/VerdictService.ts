/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Verdict } from '../models/Verdict';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VerdictService {
    /**
     * Lister tous les verdicts
     * @returns any Liste des verdicts
     * @throws ApiError
     */
    public static getApiVerdictsAll(): CancelablePromise<{ success?: boolean; data?: Array<any>; total?: number; }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/verdicts',
        });
    }
    /**
     * Détail d'un verdict
     * @param id
     * @returns Verdict Verdict trouvé
     * @throws ApiError
     */
    public static getApiVerdicts(
        id: string,
    ): CancelablePromise<Verdict> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/verdicts/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Introuvable`,
            },
        });
    }
    /**
     * Émettre un verdict
     * @param requestBody
     * @returns Verdict Verdict créé
     * @throws ApiError
     */
    public static postApiVerdicts(
        requestBody: {
            claim_id: string;
            status: 'True' | 'False' | 'ProbablyTrue' | 'Contested' | 'Unverifiable';
            confidence_score: number;
            moderator_id: string;
            is_published?: boolean;
            summary: string;
            evidences_for?: Array<string>;
            evidences_against?: Array<string>;
        },
    ): CancelablePromise<Verdict> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/verdicts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Non authentifié`,
            },
        });
    }
}
