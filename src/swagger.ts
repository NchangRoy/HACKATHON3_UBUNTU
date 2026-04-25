import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hackverse - Fact-Checking API",
      version: "1.0.0",
      description: "API pour la plateforme de fact-checking collaborative en temps de crise",
      contact: {
        name: "Hackverse Team",
        email: "support@hackverse.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de développement"
      },
      {
        url: "https://api.hackverse.com",
        description: "Serveur de production"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Token pour l'authentification"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "user_123"
            },
            name: {
              type: "string",
              example: "Jean Dupont"
            },
            email: {
              type: "string",
              format: "email",
              example: "jean@example.com"
            },
            phone: {
              type: "string",
              example: "+33612345678"
            },
            role: {
              type: "string",
              enum: ["individual", "organization"],
              example: "individual"
            },
            priority: {
              type: "number",
              description: "Crédibilité (1-5)",
              example: 3
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Rumor: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            text: {
              type: "string"
            },
            user_id: {
              type: "string"
            },
            theme_id: {
              type: "string"
            },
            location: {
              type: "string"
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Verdict: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            claim_id: {
              type: "string"
            },
            status: {
              type: "string",
              enum: ["True", "False", "ProbablyTrue", "Contested", "Unverifiable"]
            },
            confidence_score: {
              type: "number",
              minimum: 0,
              maximum: 1
            },
            summary: {
              type: "string"
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
