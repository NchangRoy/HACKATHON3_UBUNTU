import { Router } from "express";
import {
  getAllModerators,
  getModeratorById,
  createModerator
} from "../controllers/moderator.controller";

const router = Router();

/**
 * @swagger
 * /api/moderators:
 *   get:
 *     summary: Récupérer tous les modérateurs
 *     description: Obtenir la liste de tous les modérateurs (sans les mots de passe)
 *     tags:
 *       - Moderators
 *     responses:
 *       200:
 *         description: Liste des modérateurs récupérée avec succès
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
 *                   example: "Modérateurs récupérés avec succès"
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
 *                         example: "mod_1"
 *                       name:
 *                         type: string
 *                         example: "Alice Dupont"
 *                       email:
 *                         type: string
 *                         example: "alice@platform.com"
 *                       level:
 *                         type: string
 *                         enum: ["junior", "senior", "admin"]
 *                         example: "senior"
 *       500:
 *         description: Erreur serveur
 */
router.get("/", getAllModerators);

/**
 * @swagger
 * /api/moderators/{id}:
 *   get:
 *     summary: Récupérer un modérateur par ID
 *     description: Obtenir les détails d'un modérateur spécifique
 *     tags:
 *       - Moderators
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du modérateur
 *         schema:
 *           type: string
 *           example: "mod_1"
 *     responses:
 *       200:
 *         description: Modérateur récupéré avec succès
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
 *                   example: "Modérateur récupéré avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: ["junior", "senior", "admin"]
 *       404:
 *         description: Modérateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", getModeratorById);

/**
 * @swagger
 * /api/moderators:
 *   post:
 *     summary: Créer un nouveau modérateur
 *     description: Créer un compte modérateur (admin only recommended)
 *     tags:
 *       - Moderators
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Alice Dupont"
 *               email:
 *                 type: string
 *                 example: "alice@platform.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *               level:
 *                 type: string
 *                 enum: ["junior", "senior", "admin"]
 *                 example: "senior"
 *     responses:
 *       201:
 *         description: Modérateur créé avec succès
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
 *                   example: "Modérateur créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     level:
 *                       type: string
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur lors de la création du modérateur
 */
router.post("/", createModerator);

export default router;