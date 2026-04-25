import { Router } from "express";
import { login, register, verifyToken } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     description: Endpoint pour se connecter avec email et mot de passe
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Connexion réussie
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
 *                   example: "Connexion réussie"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Email ou mot de passe manquant
 *       401:
 *         description: Email ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Créer un nouveau compte utilisateur
 *     tags:
 *       - Authentication
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
 *               - phone
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               phone:
 *                 type: string
 *                 example: "+33612345678"
 *               role:
 *                 type: string
 *                 enum: [individual, organization]
 *                 example: "individual"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
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
 *                   example: "Utilisateur créé avec succès"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Champs manquants ou invalides
 *       500:
 *         description: Erreur lors de la création de l'utilisateur
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Vérifier un JWT token
 *     description: Valider un token JWT et obtenir les informations utilisateur
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
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
 *                   example: "Token valide"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     iat:
 *                       type: number
 *                     exp:
 *                       type: number
 *       401:
 *         description: Token non fourni ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.get("/verify", verifyToken);

export default router;
