/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Verdict } from '../models/Verdict';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClaimsService {
    /**
     * Créer un claim atomique
     * @param requestBody
     * @returns any Claim créé
     * @throws ApiError
     */
    public static postApiClaims(
        requestBody: {
            rumor_id: string;
            text: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/claims',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Non authentifié`,
            },
        });
    }
    /**
     * Détail d'un claim
     * @param id
     * @returns any Claim trouvé
     * @throws ApiError
     */
    public static getApiClaims(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/claims/{id}',
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
     * @param id
     * @param requestBody
     * @returns Verdict Verdict émis
     * @throws ApiError
     */
    public static postApiClaimsVerdict(
        id: string,
        requestBody: {
            status: 'True' | 'False' | 'ProbablyTrue' | 'Contested' | 'Unverifiable';
            confidence_score?: number;
            summary: string;
        },
    ): CancelablePromise<Verdict> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/claims/{id}/verdict',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Droits insuffisants`,
            },
        });
    }
    /**
     * Rapport d'audit complet
     * @param id
     * @returns any Rapport d'audit horodaté
     * @throws ApiError
     */
    public static getApiClaimsAudit(
        id: string,
    ): CancelablePromise<{
        claim_id?: string;
        genere_a?: string;
        timeline?: Array<{
            timestamp?: string;
            action?: string;
            acteur?: string;
            details?: Record<string, any>;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/claims/{id}/audit',
            path: {
                'id': id,
            },
        });
    }
}
