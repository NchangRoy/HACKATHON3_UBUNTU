import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import express, { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/auth.routes";
import rumorRoutes from "./routes/rumor.routes";
import themeRoutes from "./routes/theme.routes";
import claimRoutes from "./routes/claim.routes";
import evidenceRoutes from "./routes/evidence.routes";
import verdictRoutes from "./routes/verdict.routes";
import moderatorRoutes from "./routes/moderator.routes";
import rumorRelations from "./routes/rumorRelation.routes";
import userRoutes from "./routes/user.routes";
import { pool } from "./config/db";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "https://petstore.swagger.io",
    "http://localhost:3000"
  ]
}));

// ✅ Swagger — un seul montage, toujours actif (y compris en production)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
  },
}));

app.get("/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rumors", rumorRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/verdicts", verdictRoutes);
app.use("/api/moderators", moderatorRoutes);
app.use("/api/rumor-relations", rumorRelations);
app.use("/api/users", userRoutes);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "OK",
      message: "Server is running",
      database: "connected",
      timestamp: new Date(),
    });
  } catch {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      timestamp: new Date(),
    });
  }
});

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Hackverse - Fact-Checking API",
    version: "1.0.0",
    documentation: "/api-docs",  // URL relative, fonctionne partout
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur serveur interne",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// En local seulement — Vercel n'a pas besoin de listen()
if (process.env.NODE_ENV !== "production") {
  pool.connect()
    .then(() => console.log("PostgreSQL connecté"))
    .catch((err) => console.warn("DB non connectée :", err));

  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
}

export default app;