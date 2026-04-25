/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Rumor } from '../models/Rumor';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RumorsService {
    /**
     * Lister les rumeurs
     * @param themeId Filtrer par thème
     * @param location Filtrer par lieu
     * @param limit
     * @param offset
     * @returns any Liste des rumeurs
     * @throws ApiError
     */
    public static getApiRumors(
        themeId?: string,
        location?: string,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<Rumor>;
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rumors',
            query: {
                'theme_id': themeId,
                'location': location,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * Soumettre une rumeur
     * @param requestBody
     * @returns any Rumeur soumise
     * @throws ApiError
     */
    public static postApiRumors(
        requestBody: {
            text: string;
            theme_id?: string;
            location?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: Rumor;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rumors',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Non authentifié`,
            },
        });
    }
    /**
     * Détail d'une rumeur
     * @param id
     * @returns Rumor Rumeur trouvée
     * @throws ApiError
     */
    public static getApiRumors1(
        id: string,
    ): CancelablePromise<Rumor> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rumors/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Introuvable`,
            },
        });
    }
}
