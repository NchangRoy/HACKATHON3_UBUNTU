import * as dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/auth.routes";
import rumorRoutes from "./routes/rumor.routes";
import themeRoutes from "./routes/theme.routes";
import claimRoutes from "./routes/claim.routes";
import { pool } from "./config/db";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rumors", rumorRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/claims", claimRoutes);

// Health check endpoint
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "OK",
      message: "Server is running",
      database: "connected",
      timestamp: new Date()
    });
  } catch {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      timestamp: new Date()
    });
  }
});

// Root endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Hackverse - Fact-Checking API",
    version: "1.0.0",
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint non trouvé",
    path: req.path
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur serveur interne",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server + test DB connection
async function start() {
  try {
    await pool.connect();
    console.log("✅ PostgreSQL connecté");
  } catch (err) {
    console.error("❌ Impossible de se connecter à PostgreSQL :", err);
    console.warn("⚠️  Démarrage sans connexion DB — vérifie ton .env");
  }

  app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📚 Documentation Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}

start();

export default app;