// src/swagger.ts — spec 100% inline, fonctionne sur Vercel

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Hackverse - Fact-Checking API",
    version: "1.0.0",
    description: "API pour la plateforme de fact-checking collaborative en temps de crise",
    contact: { name: "Hackverse Team", email: "support@hackverse.com" }
  },
  servers: [
    { url: "https://hackverse-2026.vercel.app", description: "Production" },
    { url: "http://localhost:3000", description: "Développement" }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http", scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Token pour l'authentification"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "user_123" },
          name: { type: "string", example: "Jean Dupont" },
          email: { type: "string", format: "email", example: "jean@example.com" },
          phone: { type: "string", example: "+237612345678" },
          role: { type: "string", enum: ["individual", "organization"] },
          priority: { type: "number", description: "Crédibilité (1-5)", example: 3 },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Rumor: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string", example: "Fuite d'eau toxique rue Melen" },
          user_id: { type: "string" },
          theme_id: { type: "string" },
          location: { type: "string", example: "Yaoundé, Melen" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Verdict: {
        type: "object",
        properties: {
          id: { type: "string" },
          claim_id: { type: "string" },
          status: { type: "string", enum: ["True", "False", "ProbablyTrue", "Contested", "Unverifiable"] },
          confidence_score: { type: "number", minimum: 0, maximum: 1, example: 0.72 },
          summary: { type: "string" }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" }
        }
      }
    }
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Authentification et gestion des comptes" },
    { name: "Rumors", description: "Soumission et consultation des rumeurs" },
    { name: "Claims", description: "Claims atomiques et verdicts" },
    { name: "Themes", description: "Thèmes de classification" }
  ],
  paths: {

    // ── AUTH ────────────────────────────────────────────────────────
    "/api/auth/register": {
      post: {
        tags: ["Auth"], summary: "Créer un compte", security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Jean Dupont" },
                  email: { type: "string", example: "jean@example.com" },
                  password: { type: "string", example: "motdepasse123" },
                  phone: { type: "string", example: "+237612345678" },
                  role: { type: "string", enum: ["individual", "organization"] }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Compte créé", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    token: { type: "string" },
                    user: { "$ref": "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Email déjà utilisé ou données invalides",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"], summary: "Se connecter", security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "jean@example.com" },
                  password: { type: "string", example: "motdepasse123" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Connexion réussie", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    token: { type: "string" },
                    user: { "$ref": "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "401": {
            description: "Identifiants invalides",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },

    // ── USERS ──────────────────────────────────────────────────────
    "/api/users": {
      get: {
        tags: ["Users"], summary: "Lister les utilisateurs", security: [],
        parameters: [
          { in: "query", name: "theme_id", schema: { type: "string" }, description: "Filtrer par thème" },
          { in: "query", name: "location", schema: { type: "string" }, description: "Filtrer par lieu" },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "offset", schema: { type: "integer", default: 0 } }
        ],
        responses: {
          "200": {
            description: "Liste des utilisateurs", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { "$ref": "#/components/schemas/User" } },
                    total: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },

    "/api/users/{id}": {
      get: {
        tags: ["Users"], summary: "Détail d'un utilisateur", security: [],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Utilisateur trouvé", content: { "application/json": { schema: { "$ref": "#/components/schemas/User" } } } },
          "404": { description: "Introuvable", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/users/update/{id}": {
      put: {
        tags: ["Users"],
        summary: "Mettre à jour un utilisateur",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID de l'utilisateur"
          }
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Jean Dupont" },
                  phone: { type: "string", example: "+237612345678" },
                  email: { type: "string", example: "jean@example.com" }
                }
              }
            }
          }
        },

        responses: {
          "200": {
            description: "Utilisateur mis à jour avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          },

          "404": {
            description: "Utilisateur introuvable",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          },

          "400": {
            description: "Données invalides",
            content: {
              "application/json": {
                schema: {
                  "$ref": "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },

    // ── RUMORS ──────────────────────────────────────────────────────
    "/api/rumors": {
      get: {
        tags: ["Rumors"], summary: "Lister les rumeurs", security: [],
        parameters: [
          { in: "query", name: "theme_id", schema: { type: "string" }, description: "Filtrer par thème" },
          { in: "query", name: "location", schema: { type: "string" }, description: "Filtrer par lieu" },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "offset", schema: { type: "integer", default: 0 } }
        ],
        responses: {
          "200": {
            description: "Liste des rumeurs", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { "$ref": "#/components/schemas/Rumor" } },
                    total: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Rumors"], summary: "Soumettre une rumeur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", example: "Fuite d'eau toxique signalée rue Melen" },
                  theme_id: { type: "string" },
                  location: { type: "string", example: "Yaoundé, Melen" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Rumeur soumise", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { "$ref": "#/components/schemas/Rumor" }
                  }
                }
              }
            }
          },
          "401": {
            description: "Non authentifié",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },

    "/api/rumors/{id}": {
      get: {
        tags: ["Rumors"], summary: "Détail d'une rumeur", security: [],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Rumeur trouvée", content: { "application/json": { schema: { "$ref": "#/components/schemas/Rumor" } } } },
          "404": { description: "Introuvable", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        tags: ["Rumors"], summary: "Supprimer une rumeur",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Supprimée" },
          "403": { description: "Non autorisé" },
          "404": { description: "Introuvable" }
        }
      }
    },

    // ── CLAIMS ──────────────────────────────────────────────────────
    "/api/claims": {
      post: {
        tags: ["Claims"], summary: "Créer un claim atomique",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rumor_id", "text"],
                properties: {
                  rumor_id: { type: "string" },
                  text: { type: "string", example: "L'eau de la rue Melen est contaminée" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Claim créé" },
          "401": { description: "Non authentifié" }
        }
      }
    },

    "/api/claims/{id}": {
      get: {
        tags: ["Claims"], summary: "Détail d'un claim", security: [],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Claim trouvé" },
          "404": { description: "Introuvable" }
        }
      }
    },

    "/api/claims/{id}/verdict": {
      post: {
        tags: ["Claims"], summary: "Émettre un verdict",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status", "summary"],
                properties: {
                  status: { type: "string", enum: ["True", "False", "ProbablyTrue", "Contested", "Unverifiable"] },
                  confidence_score: { type: "number", minimum: 0, maximum: 1, example: 0.72 },
                  summary: { type: "string", example: "Confirmé par deux sources sanitaires" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Verdict émis", content: { "application/json": { schema: { "$ref": "#/components/schemas/Verdict" } } } },
          "403": { description: "Droits insuffisants" }
        }
      }
    },

    "/api/claims/{id}/audit": {
      get: {
        tags: ["Claims"], summary: "Rapport d'audit complet", security: [],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Rapport d'audit horodaté", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    claim_id: { type: "string" },
                    genere_a: { type: "string", format: "date-time" },
                    timeline: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          timestamp: { type: "string", format: "date-time" },
                          action: { type: "string" },
                          acteur: { type: "string" },
                          details: { type: "object" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ── THEMES ──────────────────────────────────────────────────────
    "/api/themes": {
      get: {
        tags: ["Themes"], summary: "Lister les thèmes", security: [],
        responses: {
          "200": {
            description: "Liste des thèmes", content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string", example: "Santé publique" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Themes"], summary: "Créer un thème",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Santé publique" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Thème créé" },
          "401": { description: "Non authentifié" }
        }
      }
    }
  }
};