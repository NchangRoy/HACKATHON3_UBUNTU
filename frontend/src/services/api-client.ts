import { OpenAPI } from "../api";

export const initApiClient = () => {
  // Configurer l'URL de base si nécessaire (déjà fait par le générateur mais on peut la surcharger)
  OpenAPI.BASE = "https://hackverse-2026.vercel.app";

  // Récupérer le token du localStorage au démarrage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    OpenAPI.TOKEN = token;
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
    OpenAPI.TOKEN = token;
  } else {
    localStorage.removeItem("token");
    OpenAPI.TOKEN = undefined;
  }
};

export const getAuthToken = () => {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
};
