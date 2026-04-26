import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

// Mock DB (replace with Prisma/SQL later)
const evidences: any[] = [];

/**
 * GET /api/evidence
 */
export const getAllEvidence = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Evidence récupérées avec succès",
      count: evidences.length,
      data: evidences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error
    });
  }
};

/**
 * GET /api/evidence/:id
 */
export const getEvidenceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const evidence = evidences.find(e => e.id === id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: "Evidence non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: "Evidence récupérée avec succès",
      data: evidence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error
    });
  }
};

/**
 * POST /api/evidence
 */
export const createEvidence = async (req: Request, res: Response) => {
  try {
    const {
      type,
      t_event,
      t_observation,
      hash_file,
      metadata,
      rumor_id,
      uploaded_by
    } = req.body;

    // file comes from multer
    const file = req.file;

    // Validation
    if (!type || !hash_file || !rumor_id || !uploaded_by || !file) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants (file inclus)"
      });
    }

    const newEvidence = {
      id: uuidv4(),
      type,
      file_url: `/uploads/${file.filename}`, // stored file path
      original_name: file.originalname,
      mime_type: file.mimetype,

      t_event: t_event ? new Date(t_event) : null,
      t_observation: t_observation ? new Date(t_observation) : null,
      t_upload: new Date(),

      hash_file,
      metadata: metadata ? JSON.parse(metadata) : {},

      rumor_id,
      uploaded_by
    };

    evidences.push(newEvidence);

    res.status(201).json({
      success: true,
      message: "Evidence uploadée avec succès",
      data: newEvidence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload de l'evidence",
      error
    });
  }
};