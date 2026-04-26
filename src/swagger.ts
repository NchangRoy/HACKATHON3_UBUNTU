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
      Moderator: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Modérateur Principal" },
          email: { type: "string", format: "email", example: "admin@hackverse.com" },
          level: { type: "string", enum: ["junior", "senior", "admin"] },
          role: { type: "string", example: "moderator" }
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
      },
      Evidence: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["video", "audio", "text", "image"] },
          file_url: { type: "string", example: "https://example.com/media.mp4" },
          t_event: { type: "string", format: "date-time" },
          t_observation: { type: "string", format: "date-time" },
          t_upload: { type: "string", format: "date-time" },
          hash_file: { type: "string" },
          metadata: { type: "object" },
          rumor_id: { type: "string" },
          uploaded_by: { type: "string" }
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

    "/api/auth/logout": {
      post: {
        tags: ["Auth"], summary: "Se déconnecter", security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Déconnexion réussie", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" }
                  }
                }
              }
            }
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
      },
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

    // ── MODERATORS ──────────────────────────────────────────────────────
    "/api/moderators": {
      get: {
        tags: ["Moderators"], summary: "Lister les modérateurs", security: [],
        responses: {
          "200": {
            description: "Liste des modérateurs", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { "$ref": "#/components/schemas/Moderator" } },
                    total: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Moderators"], summary: "Créer un modérateur", security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "level"],
                properties: {
                  name: { type: "string", example: "Modérateur Admin" },
                  email: { type: "string", example: "admin@hackverse.com" },
                  password: { type: "string", example: "secure123" },
                  level: { type: "string", enum: ["junior", "senior", "admin"] }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Modérateur créé", content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { "$ref": "#/components/schemas/Moderator" }
                  }
                }
              }
            }
          },
          "409": { description: "Email déjà utilisé" }
        }
      }
    },

    "/api/moderators/{id}": {
      get: {
        tags: ["Moderators"], summary: "Détail d'un modérateur", security: [],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Modérateur trouvé", content: { "application/json": { schema: { "$ref": "#/components/schemas/Moderator" } } } },
          "404": { description: "Introuvable" }
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
      }
    },


    //----rumorRelations--------------------------
    "/api/rumor-relations": {
  post: {
    tags: ["Rumor Relations"],
    summary: "Lier une rumeur à une ou plusieurs rumeurs sources",
    description: "Crée une relation BASED_ON entre une rumeur et ses rumeurs parentes",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["rumor_id", "parent_rumor_id"],
            properties: {
              rumor_id: { type: "string", example: "rumor_1" },
              parent_rumor_id: { type: "string", example: "rumor_2" },
              relation_type: { type: "string", example: "BASED_ON" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Relation créée avec succès" },
      "400": { description: "Données invalides" },
      "500": { description: "Erreur serveur" }
    }
  }
},

"/api/rumor-relations/{rumor_id}": {
  get: {
    tags: ["Rumor Relations"],
    summary: "Récupérer toutes les relations d'une rumeur",
    parameters: [
      {
        in: "path",
        name: "rumor_id",
        required: true,
        schema: { type: "string" },
        example: "rumor_1"
      }
    ],
    responses: {
      "200": { description: "Relations récupérées avec succès" },
      "404": { description: "Rumeur introuvable" },
      "500": { description: "Erreur serveur" }
    }
  }
},

"/api/rumor-relations/{id}": {
  delete: {
    tags: ["Rumor Relations"],
    summary: "Supprimer une relation entre rumeurs",
    parameters: [
      {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string" },
        example: "relation_1"
      }
    ],
    responses: {
      "200": { description: "Relation supprimée avec succès" },
      "404": { description: "Relation introuvable" },
      "500": { description: "Erreur serveur" }
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

    // ── VERDICTS ──────────────────────────────────────────────────────
    "/api/verdicts/{id}": {
      get: {
        tags: ["Verdict"], summary: "Détail d'un verdict", security: [],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Verdict trouvé", content: { "application/json": { schema: { "$ref": "#/components/schemas/Verdict" } } } },
          "404": { description: "Introuvable", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/verdicts": {
      post: {
        tags: ["Verdict"], summary: "Émettre un verdict",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["claim_id", "status", "confidence_score", "moderator_id", "summary"],
                properties: {
                  claim_id: { type: "string" },
                  status: { type: "string", enum: ["True", "False", "ProbablyTrue", "Contested", "Unverifiable"] },
                  confidence_score: { type: "number" },
                  moderator_id: { type: "string" },
                  is_published: { type: "boolean" },
                  summary: { type: "string" },
                  evidences_for: { type: "array", items: { type: "string" } },
                  evidences_against: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Verdict créé", content: { "application/json": { schema: { "$ref": "#/components/schemas/Verdict" } } } },
          "401": { description: "Non authentifié" }
        }
      }
    },

    // ── EVIDENCE ──────────────────────────────────────────────────────
  "/api/evidence/{id}": {
  get: {
    tags: ["Evidence"],
    summary: "Détail d'une preuve",
    security: [],
    parameters: [
      {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string" }
      }
    ],
    responses: {
      "200": {
        description: "Preuve trouvée",
        content: {
          "application/json": {
            schema: {
              "$ref": "#/components/schemas/Evidence"
            }
          }
        }
      },
      "404": {
        description: "Introuvable",
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

"/api/evidence": {
  get: {
    tags: ["Evidence"],
    summary: "Lister toutes les preuves",
    security: [],
    parameters: [
      {
        in: "query",
        name: "rumor_id",
        schema: { type: "string" },
        description: "Filtrer par rumeur"
      },
      {
        in: "query",
        name: "type",
        schema: {
          type: "string",
          enum: ["video", "audio", "text", "image"]
        }
      },
      {
        in: "query",
        name: "limit",
        schema: { type: "integer", default: 20 }
      },
      {
        in: "query",
        name: "offset",
        schema: { type: "integer", default: 0 }
      }
    ],
    responses: {
      "200": {
        description: "Liste des preuves",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: {
                    "$ref": "#/components/schemas/Evidence"
                  }
                },
                total: { type: "integer" }
              }
            }
          }
        }
      }
    }
  },

  post: {
    tags: ["Evidence"],
    summary: "Ajouter une preuve",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: [
              "type",
              "file_url",
              "t_event",
              "t_observation",
              "hash_file",
              "rumor_id",
              "uploaded_by"
            ],
            properties: {
              type: {
                type: "string",
                enum: ["video", "audio", "text", "image"]
              },
              file_url: {
                type: "string",
                example: "https://example.com/media.mp4"
              },
              t_event: { type: "string", format: "date-time" },
              t_observation: { type: "string", format: "date-time" },
              hash_file: { type: "string" },
              metadata: { type: "object" },
              rumor_id: { type: "string" },
              uploaded_by: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Preuve ajoutée" },
      "401": { description: "Non authentifié" }
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