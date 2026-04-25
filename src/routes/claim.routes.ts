import { Router } from "express";
import {
  getAllClaims,
  getClaimById,
  createClaim
} from "../controllers/claim.controller";

const router = Router();

/**
 * @swagger
 * /api/claims:
 *   get:
 *     summary: Récupérer tous les claims
 *     description: Obtenir la liste complète des claims avec filtrage optionnel
 *     tags:
 *       - Claims
 *     parameters:
 *       - name: rumor_id
 *         in: query
 *         required: false
 *         description: Filtrer par ID de rumeur
 *         schema:
 *           type: string
 *           example: "rumor_1"
 *       - name: is_main_claim
 *         in: query
 *         required: false
 *         description: Filtrer par claim principal (true/false)
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           example: "true"
 *     responses:
 *       200:
 *         description: Liste des claims récupérée avec succès
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
 *                   example: "Claims récupérés avec succès"
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
 *                         example: "claim_1"
 *                       text:
 *                         type: string
 *                         example: "Le vaccin est efficace"
 *                       rumor_id:
 *                         type: string
 *                         example: "rumor_1"
 *                       is_main_claim:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Erreur serveur
 */
router.get("/", getAllClaims);

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Récupérer un claim par ID
 *     description: Obtenir les détails d'un claim spécifique
 *     tags:
 *       - Claims
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du claim
 *         schema:
 *           type: string
 *           example: "claim_1"
 *     responses:
 *       200:
 *         description: Claim récupéré avec succès
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
 *                   example: "Claim récupéré avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     rumor_id:
 *                       type: string
 *                     is_main_claim:
 *                       type: boolean
 *       404:
 *         description: Claim non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", getClaimById);

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Créer un nouveau claim
 *     description: Créer un nouveau claim associé à une rumeur
 *     tags:
 *       - Claims
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - rumor_id
 *               - is_main_claim
 *             properties:
 *               text:
 *                 type: string
 *                 description: Contenu du claim
 *                 example: "Le vaccin est efficace"
 *               rumor_id:
 *                 type: string
 *                 description: ID de la rumeur associée
 *                 example: "rumor_1"
 *               is_main_claim:
 *                 type: boolean
 *                 description: Est-ce le claim principal?
 *                 example: true
 *     responses:
 *       201:
 *         description: Claim créé avec succès
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
 *                   example: "Claim créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     rumor_id:
 *                       type: string
 *                     is_main_claim:
 *                       type: boolean
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur lors de la création du claim
 */
router.post("/", createClaim);

export default router;
