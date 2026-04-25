# Guide Endpoints et Swagger

## 🚀 Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

## 📚 Documentation Swagger

Accédez à la documentation interactive Swagger :
```
http://localhost:3000/api-docs
```

## 🔐 Endpoints d'Authentification

### 1. Enregistrement (Register)
**POST** `/api/auth/register`

**Corps de la requête:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "securePassword123",
  "phone": "+33612345678",
  "role": "individual"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1234567890",
    "email": "jean@example.com",
    "name": "Jean Dupont",
    "phone": "+33612345678",
    "role": "individual",
    "createdAt": "2026-04-25T20:12:35.000Z"
  }
}
```

---

### 2. Connexion (Login)
**POST** `/api/auth/login`

**Corps de la requête:**
```json
{
  "email": "jean@example.com",
  "password": "securePassword123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "jean@example.com",
    "name": "Jean Dupont"
  }
}
```

---

### 3. Vérifier le Token
**GET** `/api/auth/verify`

**Headers requis:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Token valide",
  "user": {
    "id": "user_123",
    "email": "jean@example.com",
    "iat": 1703509955,
    "exp": 1703596355
  }
}
```

---

## 💡 Exemple d'utilisation avec cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "password": "securePassword123",
    "phone": "+33612345678",
    "role": "individual"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "securePassword123"
  }'
```

### Verify Token
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🏥 Health Check

**GET** `/api/localhost:3000/health`

Vérifie que le serveur est en ligne.

---

## 📝 Structure des fichiers

```
src/
├── index.ts                          # Serveur principal
├── swagger.ts                        # Configuration Swagger
├── Model/
│   └── types.ts                      # Types et interfaces
├── controllers/
│   └── auth.controller.ts            # Logique authentification
└── routes/
    └── auth.routes.ts                # Routes authentification
```

---

## 🔧 Ajouter un nouvel endpoint

### Étape 1: Créer le contrôleur
Dans `src/controllers/your-feature.controller.ts`:
```typescript
import { Request, Response } from "express";

export const getFeature = async (req: Request, res: Response) => {
  try {
    // Logique ici
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
```

### Étape 2: Créer les routes avec Swagger
Dans `src/routes/your-feature.routes.ts`:
```typescript
import { Router } from "express";
import { getFeature } from "../controllers/your-feature.controller";

const router = Router();

/**
 * @swagger
 * /api/your-route:
 *   get:
 *     summary: Description de votre endpoint
 *     tags:
 *       - YourTag
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/your-route", getFeature);

export default router;
```

### Étape 3: Importer dans `index.ts`
```typescript
import yourRoutes from "./routes/your-feature.routes";

app.use("/api/your-feature", yourRoutes);
```

---

## 🛡️ Authentification Bearer Token

Pour les routes protégées, utilisez le token JWT obtenu lors du login/register:

```
Authorization: Bearer <token_jwt>
```

Le token expire après **24 heures**.

---

## 🧪 Tester avec Swagger UI

1. Allez sur http://localhost:3000/api-docs
2. Cliquez sur "Authorize" (cadenas 🔒)
3. Collez votre token JWT (sans "Bearer ")
4. Tous les endpoints protégés auront accès au token

---

## 📊 Variables d'environnement

Créez un fichier `.env` à la racine:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
DB_CONNECTION=mongodb://localhost:27017/hackverse
```

---

## ✅ Checklist de déploiement

- [ ] Changer `JWT_SECRET` en production
- [ ] Configurer la base de données MongoDB
- [ ] Ajouter la validation des entrées
- [ ] Implémenter rate limiting
- [ ] Ajouter les tests unitaires
- [ ] Configurer CORS selon vos besoins
- [ ] Ajouter logging structuré
- [ ] Configurer HTTPS en production
