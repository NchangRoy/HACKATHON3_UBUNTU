"use client";
import { useEffect } from "react";
import { initApiClient } from "../services/api-client";

export function ClientInitializer() {
  useEffect(() => {
    initApiClient();
  }, []);
  return null;
}
