import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { pool } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "hackverse_jwt_secret_change_me";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "individual" | "organization";
}

/**
 * Register - Enregistrer un nouvel utilisateur
 */
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis (name, email, password, phone, role)"
      });
    }

    // Vérifier si l'email est déjà utilisé
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Un compte avec cet email existe déjà"
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, role, priority, password_hash)
       VALUES ($1, $2, $3, $4, 1, $5)
       RETURNING id, name, email, phone, role, priority, created_at`,
      [name, email, phone, role, password_hash]
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'utilisateur",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Login - Authentifier un utilisateur
 */
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis"
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Verify Token - Vérifier un JWT token
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token non fourni"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Token valide",
      user: decoded
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
