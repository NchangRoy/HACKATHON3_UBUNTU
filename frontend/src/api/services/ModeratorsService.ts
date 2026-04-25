/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Moderator } from '../models/Moderator';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModeratorsService {
    /**
     * Lister les modérateurs
     * @returns any Liste des modérateurs
     * @throws ApiError
     */
    public static getApiModerators(): CancelablePromise<{
        success?: boolean;
        data?: Array<Moderator>;
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/moderators',
        });
    }
    /**
     * Créer un modérateur
     * @param requestBody
     * @returns any Modérateur créé
     * @throws ApiError
     */
    public static postApiModerators(
        requestBody: {
            name: string;
            email: string;
            password: string;
            level: 'junior' | 'senior' | 'admin';
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: Moderator;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/moderators',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Email déjà utilisé`,
            },
        });
    }
    /**
     * Détail d'un modérateur
     * @param id
     * @returns Moderator Modérateur trouvé
     * @throws ApiError
     */
    public static getApiModerators1(
        id: string,
    ): CancelablePromise<Moderator> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/moderators/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Introuvable`,
            },
        });
    }
}
