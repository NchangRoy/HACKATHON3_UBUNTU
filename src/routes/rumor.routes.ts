import { Router } from "express";
import {
  getAllRumors,
  getRumorById,
  createRumor
} from "../controllers/rumor.controller";

const router = Router();

/**
 * @swagger
 * /api/rumors:
 *   get:
 *     summary: Récupérer toutes les rumeurs
 *     description: Obtenir la liste complète des rumeurs avec filtrage optionnel
 *     tags:
 *       - Rumors
 *     parameters:
 *       - name: theme_id
 *         in: query
 *         required: false
 *         description: Filtrer par ID de thème
 *         schema:
 *           type: string
 *           example: "theme_1"
 *       - name: user_id
 *         in: query
 *         required: false
 *         description: Filtrer par ID d'utilisateur
 *         schema:
 *           type: string
 *           example: "user_123"
 *     responses:
 *       200:
 *         description: Liste des rumeurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rumeurs récupérées avec succès"
 *                 count:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "rumor_1"
 *                       text:
 *                         type: string
 *                         example: "Une rumeur intéressante"
 *                       user_id:
 *                         type: string
 *                         example: "user_123"
 *                       theme_id:
 *                         type: string
 *                         example: "theme_1"
 *                       location:
 *                         type: string
 *                         example: "Paris, France"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Erreur serveur
 */
router.get("/", getAllRumors);

/**
 * @swagger
 * /api/rumors/{id}:
 *   get:
 *     summary: Récupérer une rumeur par ID
 *     description: Obtenir les détails d'une rumeur spécifique
 *     tags:
 *       - Rumors
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la rumeur
 *         schema:
 *           type: string
 *           example: "rumor_1"
 *     responses:
 *       200:
 *         description: Rumeur récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rumeur récupérée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     theme_id:
 *                       type: string
 *                     location:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Rumeur non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", getRumorById);

/**
 * @swagger 
 * /api/rumors/theme/{theme_id}:
 *  get:
 *   summary: Récupérer les rumeurs par thème
 *   description: Obtenir toutes les rumeurs associées à un thème spécifique
 *   tags:
 *     - Rumors
 *   parameters:
 *     - name: theme_id
 *       in: path
 *       required: true
 *       description: ID du thème
 *       schema:
 *         type: string
 *         example: "theme_1"
 *   responses:
 *     200:
 *       description: Rumeurs récupérées avec succès
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Rumeurs récupérées avec succès"
 *               count:
 *                 type: number
 *                 example: 2
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     user_id:
 *                       type: string
/**
 * @swagger
 * /api/rumors:
 *   post:
 *     summary: Créer une nouvelle rumeur
 *     description: Soumettre une nouvelle rumeur pour analyse
 *     tags:
 *       - Rumors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - user_id
 *               - theme_id
 *             properties:
 *               text:
 *                 type: string
 *                 description: Contenu de la rumeur
 *                 example: "Une nouvelle rumeur intéressante"
 *               user_id:
 *                 type: string
 *                 description: ID de l'utilisateur qui rapporte
 *                 example: "user_123"
 *               theme_id:
 *                 type: string
 *                 description: ID du thème associé
 *                 example: "theme_1"
 *               location:
 *                 type: string
 *                 description: Localisation de la rumeur (optionnel)
 *                 example: "Paris, France"
 *     responses:
 *       201:
 *         description: Rumeur créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rumeur créée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     theme_id:
 *                       type: string
 *                     location:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur lors de la création de la rumeur
 */
router.post("/", createRumor);

export default router;
