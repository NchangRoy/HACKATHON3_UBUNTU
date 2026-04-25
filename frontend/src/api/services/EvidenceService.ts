/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Evidence } from '../models/Evidence';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EvidenceService {
    /**
     * Détail d'une preuve
     * @param id
     * @returns Evidence Preuve trouvée
     * @throws ApiError
     */
    public static getApiEvidence(
        id: string,
    ): CancelablePromise<Evidence> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/evidence/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Introuvable`,
            },
        });
    }
    /**
     * Ajouter une preuve
     * @param requestBody
     * @returns any Preuve ajoutée
     * @throws ApiError
     */
    public static postApiEvidence(
        requestBody: {
            type: 'video' | 'audio' | 'text' | 'image';
            file_url: string;
            t_event: string;
            t_observation: string;
            hash_file: string;
            metadata?: Record<string, any>;
            rumor_id: string;
            uploaded_by: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/evidence',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Non authentifié`,
            },
        });
    }
}
