import { Router } from "express";
import {
  getAllEvidence,
  getEvidenceById,
  createEvidence
} from "../controllers/evidence.controller";
import { upload } from "../../middlewares/upload";

const router = Router();

/**
 * @swagger
 * components:
 * schemas:
 * EvidenceType:
 * type: string
 * enum: [video, audio, text, image]
 * Evidence:
 * type: object
 * properties:
 * id:
 * type: string
 * format: uuid
 * type:
 * $ref: '#/components/schemas/EvidenceType'
 * file_url:
 * type: string
 * format: uri
 * t_event:
 * type: string
 * format: date-time
 * t_observation:
 * type: string
 * format: date-time
 * t_upload:
 * type: string
 * format: date-time
 * hash_file:
 * type: string
 * description: SHA256 hash of the file for integrity
 * metadata:
 * type: object
 * additionalProperties: true
 * rumor_id:
 * type: string
 * uploaded_by:
 * type: string
 */

/**
 * @swagger
 * tags:
 * name: Evidence
 * description: Gestion des preuves techniques et métadonnées d'intégrité
 */

/**
 * @swagger
 * /api/evidence:
 * get:
 * summary: Récupérer toutes les preuves
 * tags: [Evidence]
 * responses:
 * 200:
 * description: Succès
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * count:
 * type: integer
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/Evidence'
 */
router.get("/", getAllEvidence);

/**
 * @swagger
 * /api/evidence/{id}:
 * get:
 * summary: Récupérer une preuve par ID
 * tags: [Evidence]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Evidence trouvée
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Evidence'
 * 404:
 * description: Preuve introuvable
 */
router.get("/:id", getEvidenceById);

/**
 * @swagger
 * /api/evidence:
 * post:
 * summary: Créer une preuve (avec upload de fichier)
 * description: Envoie les métadonnées et le fichier physique simultanément.
 * tags: [Evidence]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * required:
 * - file
 * - type
 * - t_event
 * - t_observation
 * - rumor_id
 * - uploaded_by
 * properties:
 * file:
 * type: string
 * format: binary
 * description: Le fichier physique (Image/Vidéo/Audio)
 * type:
 * $ref: '#/components/schemas/EvidenceType'
 * t_event:
 * type: string
 * format: date-time
 * t_observation:
 * type: string
 * format: date-time
 * rumor_id:
 * type: string
 * uploaded_by:
 * type: string
 * metadata:
 * type: string
 * description: JSON stringified metadata object
 * responses:
 * 201:
 * description: Evidence créée et fichier uploadé
 * 400:
 * description: Données invalides ou fichier manquant
 */
router.post("/", upload.single("file"), createEvidence);

export default router;