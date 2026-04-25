import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * GET /api/claims - Récupérer tous les claims (filtre optionnel: rumor_id)
 */
export const getAllClaims = async (req: Request, res: Response) => {
  try {
    const { rumor_id } = req.query;

    let query = "SELECT id, text, rumor_id FROM claims";
    const values: any[] = [];

    if (rumor_id) {
      query += " WHERE rumor_id = $1";
      values.push(rumor_id);
    }

    query += " ORDER BY id";

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      message: "Claims récupérés avec succès",
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des claims",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * GET /api/claims/:id - Récupérer un claim par ID
 */
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, text, rumor_id FROM claims WHERE id = $1",
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Claim non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Claim récupéré avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du claim",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * POST /api/claims - Créer un nouveau claim
 */
export const createClaim = async (req: Request, res: Response) => {
  try {
    const { text, rumor_id } = req.body;

    if (!text || !rumor_id) {
      return res.status(400).json({
        success: false,
        message: "Les champs 'text' et 'rumor_id' sont requis"
      });
    }

    // Vérifier que la rumeur existe
    const rumorCheck = await pool.query("SELECT id FROM rumors WHERE id = $1", [rumor_id]);
    if (!rumorCheck.rowCount || rumorCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Rumeur non trouvée"
      });
    }

    const result = await pool.query(
      "INSERT INTO claims (text, rumor_id) VALUES ($1, $2) RETURNING id, text, rumor_id",
      [text, rumor_id]
    );

    return res.status(201).json({
      success: true,
      message: "Claim créé avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du claim",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};