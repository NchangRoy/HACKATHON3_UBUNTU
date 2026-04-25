/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Créer un compte
     * @param requestBody
     * @returns any Compte créé
     * @throws ApiError
     */
    public static postApiAuthRegister(
        requestBody: {
            name: string;
            email: string;
            password: string;
            phone?: string;
            role?: 'individual' | 'organization';
        },
    ): CancelablePromise<{
        success?: boolean;
        token?: string;
        user?: User;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Email déjà utilisé ou données invalides`,
            },
        });
    }
    /**
     * Se connecter
     * @param requestBody
     * @returns any Connexion réussie
     * @throws ApiError
     */
    public static postApiAuthLogin(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        token?: string;
        user?: User;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Identifiants invalides`,
            },
        });
    }
    /**
     * Se déconnecter
     * @returns any Déconnexion réussie
     * @throws ApiError
     */
    public static postApiAuthLogout(): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
        });
    }
}
