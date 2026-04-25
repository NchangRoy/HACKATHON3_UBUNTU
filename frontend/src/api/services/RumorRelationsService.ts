/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RumorRelationsService {
    /**
     * Lier une rumeur à une ou plusieurs rumeurs sources
     * Crée une relation BASED_ON entre une rumeur et ses rumeurs parentes
     * @param requestBody
     * @returns any Relation créée avec succès
     * @throws ApiError
     */
    public static postApiRumorRelations(
        requestBody: {
            rumor_id: string;
            parent_rumor_id: string;
            relation_type?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rumor-relations',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Données invalides`,
                500: `Erreur serveur`,
            },
        });
    }
    /**
     * Récupérer toutes les relations d'une rumeur
     * @param rumorId
     * @returns any Relations récupérées avec succès
     * @throws ApiError
     */
    public static getApiRumorRelations(
        rumorId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rumor-relations/{rumor_id}',
            path: {
                'rumor_id': rumorId,
            },
            errors: {
                404: `Rumeur introuvable`,
                500: `Erreur serveur`,
            },
        });
    }
    /**
     * Supprimer une relation entre rumeurs
     * @param id
     * @returns any Relation supprimée avec succès
     * @throws ApiError
     */
    public static deleteApiRumorRelations(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/rumor-relations/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Relation introuvable`,
                500: `Erreur serveur`,
            },
        });
    }
}
