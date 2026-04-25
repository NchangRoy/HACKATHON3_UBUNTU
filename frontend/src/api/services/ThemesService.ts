/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ThemesService {
    /**
     * Lister les thèmes
     * @returns any Liste des thèmes
     * @throws ApiError
     */
    public static getApiThemes(): CancelablePromise<Array<{
        id?: string;
        name?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/themes',
        });
    }
    /**
     * Créer un thème
     * @param requestBody
     * @returns any Thème créé
     * @throws ApiError
     */
    public static postApiThemes(
        requestBody: {
            name: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/themes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Non authentifié`,
            },
        });
    }
}
