import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * GET /api/rumors - Récupérer toutes les rumeurs (filtres optionnels: theme_id, user_id)
 */
export const getAllRumors = async (req: Request, res: Response) => {
  try {
    const { theme_id, user_id } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (theme_id) {
      conditions.push(`theme_id = $${idx++}`);
      values.push(theme_id);
    }
    if (user_id) {
      conditions.push(`user_id = $${idx++}`);
      values.push(user_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT id, text, user_id, theme_id, location, created_at
       FROM rumors ${where}
       ORDER BY created_at DESC`,
      values
    );

    return res.status(200).json({
      success: true,
      message: "Rumeurs récupérées avec succès",
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rumeurs",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * GET /api/rumors/:id - Récupérer une rumeur par ID
 */
export const getRumorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, text, user_id, theme_id, location, created_at FROM rumors WHERE id = $1",
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Rumeur non trouvée"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rumeur récupérée avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la rumeur",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * POST /api/rumors - Créer une nouvelle rumeur
 */
export const createRumor = async (req: Request, res: Response) => {
  try {
    const { text, user_id, theme_id, location } = req.body;

    if (!text || !user_id || !theme_id) {
      return res.status(400).json({
        success: false,
        message: "Les champs 'text', 'user_id' et 'theme_id' sont requis"
      });
    }

    // Vérifier que le thème existe
    const themeCheck = await pool.query("SELECT id FROM themes WHERE id = $1", [theme_id]);
    if (!themeCheck.rowCount || themeCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Thème non trouvé"
      });
    }

    // Vérifier que l'utilisateur existe
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [user_id]);
    if (!userCheck.rowCount || userCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const result = await pool.query(
      `INSERT INTO rumors (text, user_id, theme_id, location)
       VALUES ($1, $2, $3, $4)
       RETURNING id, text, user_id, theme_id, location, created_at`,
      [text, user_id, theme_id, location || null]
    );

    return res.status(201).json({
      success: true,
      message: "Rumeur créée avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la rumeur",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
