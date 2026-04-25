# Rapport d'implémentation — Backend
## Plateforme de fact-checking collaboratif — Sujet 11

---

## 1. Vue d'ensemble

Le backend est le garant de trois invariants non négociables :

- **Immuabilité** — rien ne se supprime, rien ne se met à jour silencieusement
- **Traçabilité** — chaque action est horodatée avec 6 timestamps distincts
- **Défendabilité** — le système peut reconstruire l'état exact à n'importe quel moment passé

Ces trois contraintes dictent toutes les décisions d'architecture.

---

## 2. Stack technique

| Élément | Choix | Justification |
|---|---|---|
| Runtime | **Node.js 20 + TypeScript** | Typage strict, écosystème riche |
| Framework API | **Fastify** | Plus rapide qu'Express, validation native via JSON Schema |
| ORM | **Prisma** | Migrations versionnées, typage auto-généré |
| Base de données | **PostgreSQL 16** | Transactions ACID, JSONB pour les métadonnées flexibles |
| Cache | **Redis** | Cache des scores ML, sessions, pub/sub Socket.IO |
| File d'attente | **BullMQ** | Jobs de rescore ML asynchrones |
| WebSocket | **Socket.IO** | Notifications temps réel modérateur + public |
| Auth | **JWT + refresh tokens** | Stateless, compatible microservices |
| Stockage fichiers | **MinIO** (S3-compatible) | Preuves (vidéos, images, docs), hash intégrité |

---

## 3. Schéma de base de données

### Principe cardinal : INSERT uniquement, jamais UPDATE ni DELETE

```sql
-- ══════════════════════════════════════
-- TABLE : claims
-- ══════════════════════════════════════
CREATE TABLE claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texte         TEXT NOT NULL,                    -- affirmation atomique et testable
  rumeur_source TEXT,                             -- texte brut original soumis
  statut        VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
  score_ml      DECIMAL(4,3),                     -- 0.000 → 1.000, null si pas encore scoré
  score_ml_at   TIMESTAMPTZ,                      -- quand le dernier score a été calculé
  score_ml_v    VARCHAR(20),                      -- version du modèle qui a produit ce score
  similar_to    UUID REFERENCES claims(id),       -- si c'est un doublon détecté par ML
  cree_a        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par      UUID REFERENCES users(id)
);

-- ══════════════════════════════════════
-- TABLE : evidences
-- Immuable — aucun UPDATE autorisé
-- ══════════════════════════════════════
CREATE TABLE evidences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id          UUID NOT NULL REFERENCES claims(id),
  
  -- Contenu
  type              VARCHAR(20) NOT NULL,          -- VIDEO, TEXTE, IMAGE, DOCUMENT, AUDIO
  stance            VARCHAR(10) NOT NULL,          -- SUPPORTE, CONTREDIT, NEUTRE
  contenu_url       TEXT,                          -- URL MinIO du fichier
  contenu_texte     TEXT,                          -- si type = TEXTE
  hash_sha256       VARCHAR(64),                   -- intégrité du fichier
  
  -- Auteur et rôle au moment de la soumission
  auteur_id         UUID NOT NULL REFERENCES users(id),
  role_au_moment    VARCHAR(30) NOT NULL,          -- snapshot du rôle, pas une FK live
  
  -- Les 6 timestamps distincts
  t_evenement       TIMESTAMPTZ,                   -- quand l'événement s'est produit (estimé)
  t_observation     TIMESTAMPTZ,                   -- quand la preuve a été créée (EXIF, etc.)
  t_upload          TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- quand uploadé sur la plateforme
  t_moderation      TIMESTAMPTZ,                   -- quand un modérateur l'a examinée
  t_publication     TIMESTAMPTZ,                   -- quand visible publiquement
  t_retractation    TIMESTAMPTZ,                   -- si rétractée (null si toujours valide)
  
  -- Pondération
  confiance_initiale DECIMAL(3,2),                 -- calculée selon rôle + type
  confiance_moderee  DECIMAL(3,2),                 -- ajustée par modérateur
  
  -- Métadonnées flexibles (géolocalisation EXIF, etc.)
  metadata          JSONB DEFAULT '{}',
  
  -- Flags ML
  flag_suspect      BOOLEAN DEFAULT FALSE,
  flag_raison       TEXT
);

-- ══════════════════════════════════════
-- TABLE : verdicts
-- Immuable — chaque verdict est un INSERT
-- Le lien vers le précédent assure la chaîne
-- ══════════════════════════════════════
CREATE TABLE verdicts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id        UUID NOT NULL REFERENCES claims(id),
  
  -- Statut structuré — jamais "VRAI/FAUX" seul
  statut          VARCHAR(20) NOT NULL,            -- CONTESTE, PROB_VRAI, PROB_FAUX, CONFIRME, REFUTE
  confiance       DECIMAL(3,2) NOT NULL,           -- 0.00 → 1.00
  
  -- Sources utilisées pour ce verdict
  sources_pour    UUID[] DEFAULT '{}',             -- IDs des evidences qui supportent
  sources_contre  UUID[] DEFAULT '{}',             -- IDs des evidences qui contredisent
  desaccord_actif BOOLEAN DEFAULT FALSE,           -- true si désaccord résiduel significatif
  
  -- Règle appliquée — obligatoire, versionnée
  regle_id        UUID NOT NULL REFERENCES regles(id),
  
  -- Qui a décidé
  moderateur_id   UUID NOT NULL REFERENCES users(id),
  role_moderateur VARCHAR(30) NOT NULL,            -- snapshot du rôle au moment du verdict
  
  -- Chaîne de succession
  supersede_id    UUID REFERENCES verdicts(id),    -- verdict précédent que celui-ci remplace
  
  -- Textes
  note_publique   TEXT,                            -- affiché publiquement
  note_interne    TEXT,                            -- visible modérateurs seulement
  
  -- Timestamps
  cree_a          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  publie_a        TIMESTAMPTZ
);

-- ══════════════════════════════════════
-- TABLE : regles
-- Les règles de décision sont versionnées
-- ══════════════════════════════════════
CREATE TABLE regles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version         VARCHAR(10) NOT NULL UNIQUE,     -- ex: "v2.1"
  titre           TEXT NOT NULL,
  conditions      TEXT NOT NULL,                   -- texte lisible par un humain
  logique_json    JSONB,                           -- version machine de la logique
  active_from     TIMESTAMPTZ NOT NULL,
  active_until    TIMESTAMPTZ,                     -- null = règle encore active
  cree_par        UUID REFERENCES users(id)
);

-- ══════════════════════════════════════
-- TABLE : users
-- ══════════════════════════════════════
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'CITIZEN',
  certifie_at     TIMESTAMPTZ,                     -- quand le rôle MODERATOR a été accordé
  cree_a          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- TABLE : audit_log
-- Log de toutes les actions — append only
-- ══════════════════════════════════════
CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  entite_type     VARCHAR(20) NOT NULL,            -- CLAIM, EVIDENCE, VERDICT, REGLE
  entite_id       UUID NOT NULL,
  action          VARCHAR(30) NOT NULL,            -- CREATED, SCORED, ASSIGNED, VERDICT_EMIS, etc.
  acteur_id       UUID REFERENCES users(id),
  role_acteur     VARCHAR(30),
  payload         JSONB DEFAULT '{}',              -- snapshot de l'état au moment de l'action
  ip_address      INET,
  cree_a          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_claims_statut ON claims(statut);
CREATE INDEX idx_claims_score_ml ON claims(score_ml ASC NULLS LAST);
CREATE INDEX idx_evidences_claim ON evidences(claim_id);
CREATE INDEX idx_verdicts_claim ON verdicts(claim_id, cree_a DESC);
CREATE INDEX idx_audit_entite ON audit_log(entite_type, entite_id, cree_a DESC);
```

---

## 4. Architecture API

### 4.1 Structure des routes

```
/api/v1/
│
├── /claims
│   ├── POST   /                  # Soumettre une nouvelle rumeur
│   ├── GET    /                  # Liste paginée (avec filtres)
│   ├── GET    /:id               # Détail d'un claim
│   ├── GET    /:id/verdicts      # Historique des verdicts
│   ├── GET    /:id/evidences     # Liste des preuves
│   ├── GET    /:id/audit         # Rapport d'audit complet
│   ├── GET    /:id/propagation   # Graphe Twitter
│   └── POST   /:id/assign        # Assigner à un modérateur
│
├── /evidences
│   ├── POST   /                  # Soumettre une preuve
│   └── GET    /:id               # Détail d'une preuve
│
├── /verdicts
│   └── POST   /                  # Émettre un verdict (INSERT only)
│
├── /regles
│   ├── GET    /                  # Lister les règles actives
│   ├── POST   /                  # Créer une nouvelle règle (admin)
│   └── GET    /:id/preview       # Prévisualiser le résultat d'une règle
│
├── /ml
│   ├── POST   /score             # Déclencher un rescore manuel
│   └── GET    /:claimId/features # Features ML calculées
│
└── /auth
    ├── POST   /login
    ├── POST   /refresh
    └── POST   /logout
```

### 4.2 Exemple de handler — Soumission d'un verdict

```typescript
// src/routes/verdicts/create.ts

interface CreateVerdictBody {
  claim_id: string
  statut: 'CONTESTE' | 'PROB_VRAI' | 'PROB_FAUX' | 'CONFIRME' | 'REFUTE'
  confiance: number
  sources_pour: string[]
  sources_contre: string[]
  regle_id: string
  note_publique: string
  note_interne?: string
}

export const createVerdict = async (
  req: FastifyRequest<{ Body: CreateVerdictBody }>,
  reply: FastifyReply
) => {
  const { user } = req  // injecté par le middleware d'auth

  // 1. Vérifier que l'utilisateur est modérateur
  if (!['MODERATOR', 'ADMIN'].includes(user.role)) {
    return reply.status(403).send({ error: 'Droits insuffisants' })
  }

  // 2. Vérifier que la règle est bien active
  const regle = await prisma.regles.findFirst({
    where: {
      id: req.body.regle_id,
      active_from: { lte: new Date() },
      OR: [{ active_until: null }, { active_until: { gt: new Date() } }]
    }
  })
  if (!regle) {
    return reply.status(400).send({ error: 'Règle inactive ou introuvable' })
  }

  // 3. Récupérer le verdict actuel pour la chaîne de succession
  const verdictActuel = await prisma.verdicts.findFirst({
    where: { claim_id: req.body.claim_id },
    orderBy: { cree_a: 'desc' }
  })

  // 4. Créer le nouveau verdict — toujours INSERT
  const verdict = await prisma.$transaction(async (tx) => {
    const v = await tx.verdicts.create({
      data: {
        claim_id:       req.body.claim_id,
        statut:         req.body.statut,
        confiance:      req.body.confiance,
        sources_pour:   req.body.sources_pour,
        sources_contre: req.body.sources_contre,
        desaccord_actif: req.body.sources_pour.length > 0 && req.body.sources_contre.length > 0,
        regle_id:       req.body.regle_id,
        moderateur_id:  user.id,
        role_moderateur: user.role,          // snapshot au moment de la décision
        supersede_id:   verdictActuel?.id ?? null,
        note_publique:  req.body.note_publique,
        note_interne:   req.body.note_interne,
        publie_a:       new Date(),
      }
    })

    // 5. Logger l'action dans audit_log
    await tx.audit_log.create({
      data: {
        entite_type: 'VERDICT',
        entite_id:   v.id,
        action:      'VERDICT_EMIS',
        acteur_id:   user.id,
        role_acteur: user.role,
        payload: {
          claim_id:        req.body.claim_id,
          statut:          req.body.statut,
          confiance:       req.body.confiance,
          regle_version:   regle.version,
          supersede_id:    verdictActuel?.id ?? null,
          sources_pour_n:  req.body.sources_pour.length,
          sources_contre_n: req.body.sources_contre.length,
        },
        ip_address: req.ip,
      }
    })

    return v
  })

  // 6. Notifier via Socket.IO
  req.server.io.to(`claim:${req.body.claim_id}`).emit('new_verdict', {
    claim_id: req.body.claim_id,
    statut: verdict.statut,
    confiance: verdict.confiance,
  })

  // 7. Déclencher un rescore ML en arrière-plan
  await mlQueue.add('rescore', { claim_id: req.body.claim_id, trigger: 'new_verdict' })

  return reply.status(201).send(verdict)
}
```

---

## 5. Génération du rapport d'audit

C'est la fonction la plus importante du backend — c'est elle qui répond à l'avocat.

```typescript
// src/services/audit.service.ts

export const generateAuditReport = async (claimId: string) => {
  // Récupérer toutes les entrées du log pour ce claim
  const logs = await prisma.audit_log.findMany({
    where: { entite_id: claimId },
    orderBy: { cree_a: 'asc' }
  })

  // Récupérer toutes les evidences
  const evidences = await prisma.evidences.findMany({
    where: { claim_id: claimId },
    include: { auteur: { select: { email: true } } },
    orderBy: { t_upload: 'asc' }
  })

  // Récupérer toute la chaîne de verdicts (ordre chrono)
  const verdicts = await getVerdictChain(claimId)

  return {
    claim_id: claimId,
    genere_a: new Date().toISOString(),
    resume: {
      nb_evidences:      evidences.length,
      nb_verdicts:       verdicts.length,
      statut_actuel:     verdicts[0]?.statut ?? 'EN_ATTENTE',
      premiere_soumission: logs[0]?.cree_a,
      dernier_verdict:   verdicts[0]?.cree_a,
    },
    timeline: [
      ...logs.map(log => ({
        timestamp:  log.cree_a,
        type:       'ACTION',
        action:     log.action,
        acteur:     log.acteur_id,
        role:       log.role_acteur,
        details:    log.payload,
      })),
      ...evidences.map(e => ({
        timestamp:  e.t_upload,
        type:       'EVIDENCE',
        action:     `Preuve soumise — ${e.type} — stance: ${e.stance}`,
        acteur:     e.auteur.email,
        role:       e.role_au_moment,
        details: {
          hash:             e.hash_sha256,
          confiance_initiale: e.confiance_initiale,
          t_observation:    e.t_observation,
          t_evenement:      e.t_evenement,
        },
      })),
      ...verdicts.map(v => ({
        timestamp:  v.cree_a,
        type:       'VERDICT',
        action:     `Verdict émis → ${v.statut} (confiance: ${v.confiance})`,
        acteur:     v.moderateur_id,
        role:       v.role_moderateur,
        details: {
          regle_id:        v.regle_id,
          supersede_id:    v.supersede_id,
          sources_pour_n:  v.sources_pour.length,
          sources_contre_n: v.sources_contre.length,
          note_publique:   v.note_publique,
        },
      })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
  }
}

// Remonte la chaîne de verdicts (ordre anti-chrono = du plus récent au plus ancien)
const getVerdictChain = async (claimId: string): Promise<Verdict[]> => {
  const chain: Verdict[] = []
  let current = await prisma.verdicts.findFirst({
    where: { claim_id: claimId },
    orderBy: { cree_a: 'desc' }
  })

  while (current) {
    chain.push(current)
    if (!current.supersede_id) break
    current = await prisma.verdicts.findUnique({ where: { id: current.supersede_id } })
  }

  return chain
}
```

---

## 6. File d'attente ML avec BullMQ

```typescript
// src/queues/ml.queue.ts

export const mlQueue = new Queue('ml-scoring', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }
})

// Worker qui traite les jobs de rescore
export const mlWorker = new Worker('ml-scoring', async (job) => {
  const { claim_id, trigger } = job.data

  // Appeler le service ML (Python FastAPI)
  const response = await fetch(`${ML_SERVICE_URL}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim_id })
  })
  const { score, features, model_version } = await response.json()

  // Mettre à jour le score dans la DB
  await prisma.claims.update({
    where: { id: claim_id },
    data: {
      score_ml:    score,
      score_ml_at: new Date(),
      score_ml_v:  model_version,
    }
  })

  // Logger le rescore
  await prisma.audit_log.create({
    data: {
      entite_type: 'CLAIM',
      entite_id:   claim_id,
      action:      'ML_RESCORE',
      payload: { score, features, trigger, model_version },
    }
  })

  // Notifier le frontend
  io.to(`claim:${claim_id}`).emit('ml_rescore', { claim_id, new_score: score })

}, { connection: redisConnection })
```

---

## 7. Upload et intégrité des preuves

```typescript
// src/services/evidence.service.ts

export const uploadEvidence = async (
  file: MultipartFile,
  claimId: string,
  userId: string,
  metadata: EvidenceMetadata
) => {
  // 1. Calculer le hash SHA256 pour garantir l'intégrité
  const buffer = await file.toBuffer()
  const hash = createHash('sha256').update(buffer).digest('hex')

  // 2. Uploader vers MinIO
  const objectName = `claims/${claimId}/${hash}-${file.filename}`
  await minioClient.putObject(
    process.env.MINIO_BUCKET,
    objectName,
    buffer,
    { 'Content-Type': file.mimetype }
  )

  // 3. Extraire les métadonnées EXIF si image/vidéo
  let exifData = {}
  if (file.mimetype.startsWith('image/')) {
    exifData = await extractExif(buffer)
  }

  // 4. Calculer la confiance initiale selon rôle + type
  const user = await prisma.users.findUnique({ where: { id: userId } })
  const confianceInitiale = calculateInitialConfidence(user.role, file.mimetype)

  // 5. Persister en base
  const evidence = await prisma.evidences.create({
    data: {
      claim_id:          claimId,
      type:              getMimeType(file.mimetype),
      stance:            metadata.stance,
      contenu_url:       objectName,
      hash_sha256:       hash,
      auteur_id:         userId,
      role_au_moment:    user.role,
      t_evenement:       metadata.t_evenement ?? null,
      t_observation:     exifData.dateTime ?? metadata.t_observation ?? null,
      t_upload:          new Date(),
      confiance_initiale: confianceInitiale,
      metadata:          { ...exifData, ...metadata.extra },
    }
  })

  return evidence
}

// Calcul de confiance initiale basé sur le rôle et le type de preuve
const calculateInitialConfidence = (role: string, mimetype: string): number => {
  const roleWeight = {
    ADMIN:      1.0,
    MODERATOR:  0.9,
    JOURNALIST: 0.7,
    CITIZEN:    0.4,
  }[role] ?? 0.3

  const typeBonus = mimetype.startsWith('video/') ? 0.15  // vidéo > texte
                  : mimetype.startsWith('image/') ? 0.1
                  : mimetype === 'application/pdf' ? 0.1
                  : 0

  return Math.min(1.0, roleWeight + typeBonus)
}
```

---

## 8. Middleware de sécurité et immuabilité

```typescript
// Intercepteur Prisma — interdit les DELETE et UPDATE sur les tables critiques
prisma.$use(async (params, next) => {
  const IMMUTABLE_TABLES = ['evidences', 'verdicts', 'audit_log']

  if (IMMUTABLE_TABLES.includes(params.model?.toLowerCase() ?? '')) {
    if (['delete', 'deleteMany', 'update', 'updateMany'].includes(params.action)) {
      throw new Error(
        `[IMMUABILITÉ] ${params.action} interdit sur ${params.model}. ` +
        `Utiliser INSERT uniquement.`
      )
    }
  }

  return next(params)
})
```

---

## 9. Variables d'environnement

```bash
# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/factcheck

# Redis
REDIS_URL=redis://localhost:6379

# MinIO (stockage fichiers)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=factcheck-evidences

# Service ML Python
ML_SERVICE_URL=http://localhost:8000

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

---

## 10. Points critiques à ne pas rater

1. **L'intercepteur Prisma qui interdit DELETE/UPDATE** sur evidences/verdicts/audit_log doit être le premier middleware chargé
2. **Le hash SHA256** de chaque fichier uploadé est calculé côté serveur, pas côté client — c'est lui qui prouve l'intégrité devant un avocat
3. **Le snapshot du rôle** au moment d'une action (champ `role_au_moment`, `role_moderateur`) — car le rôle d'un utilisateur peut changer dans le temps, il faut capturer ce qu'il était au moment de la décision
4. **Le rescore ML est asynchrone** — il ne bloque jamais la réponse HTTP, il passe toujours par BullMQ
5. **Chaque action dans audit_log est un INSERT** — y compris les rescores ML, les assignations, les changements de règle

---

*Document généré pour le Hackathon — Sujet 11 Social/Civic Tech*
