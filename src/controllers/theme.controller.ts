import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * GET /api/themes - Récupérer tous les thèmes
 */
export const getAllThemes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description FROM themes ORDER BY title ASC"
    );

    return res.status(200).json({
      success: true,
      message: "Thèmes récupérés avec succès",
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des thèmes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * GET /api/themes/:id - Récupérer un thème par ID
 */
export const getThemeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, title, description FROM themes WHERE id = $1",
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Thème non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Thème récupéré avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du thème",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * POST /api/themes - Créer un nouveau thème
 */
export const createTheme = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Le titre du thème est requis"
      });
    }

    const result = await pool.query(
      "INSERT INTO themes (title, description) VALUES ($1, $2) RETURNING id, title, description",
      [title, description || null]
    );

    return res.status(201).json({
      success: true,
      message: "Thème créé avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du thème",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
