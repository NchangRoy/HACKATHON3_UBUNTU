/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Lister les utilisateurs
     * @param themeId Filtrer par thème
     * @param location Filtrer par lieu
     * @param limit
     * @param offset
     * @returns any Liste des utilisateurs
     * @throws ApiError
     */
    public static getApiUsers(
        themeId?: string,
        location?: string,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<User>;
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
            query: {
                'theme_id': themeId,
                'location': location,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * Détail d'un utilisateur
     * @param id
     * @returns User Utilisateur trouvé
     * @throws ApiError
     */
    public static getApiUsers1(
        id: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Introuvable`,
            },
        });
    }
    /**
     * Mettre à jour un utilisateur
     * @param id ID de l'utilisateur
     * @param requestBody
     * @returns any Utilisateur mis à jour avec succès
     * @throws ApiError
     */
    public static putApiUsers(
        id: string,
        requestBody: {
            name?: string;
            phone?: string;
            email?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: User;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Données invalides`,
                404: `Utilisateur introuvable`,
            },
        });
    }
}
