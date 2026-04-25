import { Router } from "express";
import {
  getAllThemes,
  getThemeById,
  createTheme
} from "../controllers/theme.controller";

const router = Router();

/**
 * @swagger
 * /api/themes:
 *   get:
 *     summary: Récupérer tous les thèmes
 *     description: Obtenir la liste complète de tous les thèmes disponibles
 *     tags:
 *       - Themes
 *     responses:
 *       200:
 *         description: Liste des thèmes récupérée avec succès
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
 *                   example: "Thèmes récupérés avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "theme_1"
 *                       title:
 *                         type: string
 *                         example: "Santé publique"
 *                       description:
 *                         type: string
 *                         example: "Rumeurs liées à la santé"
 *       500:
 *         description: Erreur serveur
 */
router.get("/", getAllThemes);

/**
 * @swagger
 * /api/themes/{id}:
 *   get:
 *     summary: Récupérer un thème par ID
 *     description: Obtenir les détails d'un thème spécifique
 *     tags:
 *       - Themes
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du thème
 *         schema:
 *           type: string
 *           example: "theme_1"
 *     responses:
 *       200:
 *         description: Thème récupéré avec succès
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
 *                   example: "Thème récupéré avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       404:
 *         description: Thème non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", getThemeById);

/**
 * @swagger
 * /api/themes:
 *   post:
 *     summary: Créer un nouveau thème
 *     description: Créer un nouveau thème de rumeur
 *     tags:
 *       - Themes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du thème
 *                 example: "Événements naturels"
 *               description:
 *                 type: string
 *                 description: Description du thème (optionnel)
 *                 example: "Rumeurs liées aux phénomènes naturels"
 *     responses:
 *       201:
 *         description: Thème créé avec succès
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
 *                   example: "Thème créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Champ titre requis manquant
 *       500:
 *         description: Erreur lors de la création du thème
 */
router.post("/", createTheme);

export default router;
