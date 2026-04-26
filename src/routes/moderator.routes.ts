import { Router } from "express";
import {
  getAllModerators,
  getModeratorById,
  createModerator,
} from "../controllers/moderator.controller";

const router = Router();

/**
 * @swagger
 * /api/moderators:
 *   get:
 *     summary: Lister les modérateurs
 *     tags: [Moderators]
 *     responses:
 *       200:
 *         description: Liste des modérateurs
 */
router.get("/", getAllModerators);

/**
 * @swagger
 * /api/moderators/{id}:
 *   get:
 *     summary: Récupérer un modérateur par ID
 *     tags: [Moderators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Modérateur trouvé
 *       404:
 *         description: Introuvable
 */
router.get("/:id", getModeratorById);

/**
 * @swagger
 * /api/moderators:
 *   post:
 *     summary: Créer un moderateur
 *     tags: [Moderators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, level]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [junior, senior, admin]
 *     responses:
 *       201:
 *         description: Modérateur créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà existant
 */
router.post("/", createModerator);

export default router;

