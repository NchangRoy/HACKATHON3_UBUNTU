import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * GET /api/users - Récupérer tous les utilisateurs
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, priority, created_at FROM users ORDER BY created_at DESC"
    );

    return res.status(200).json({
      success: true,
      message: "Utilisateurs récupérés avec succès",
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * GET /api/users/:id - Récupérer un utilisateur par ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email, phone, role, priority, created_at FROM users WHERE id = $1",
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Utilisateur récupéré avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * PUT /api/users/:id - Mettre à jour un utilisateur (name, phone)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID requis"
      });
    }

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: "Au moins un champ à mettre à jour est requis (name ou phone)"
      });
    }

    // Construction dynamique de la requête UPDATE
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (phone) {
      fields.push(`phone = $${idx++}`);
      values.push(phone);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, name, email, phone, role, priority, created_at`,
      values
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};