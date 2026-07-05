import axios from "axios";

/**
 * Instancia central de Axios. TODAS las llamadas a la API pasan por
 * aquí — ningún archivo de features/ crea su propio cliente HTTP.
 *
 * Responsabilidades:
 * 1. Adjuntar el header Authorization automáticamente (ningún hook o
 *    componente necesita saber que existe un token).
 * 2. Si el backend responde 401 (token ausente/inválido/expirado),
 *    limpiar la sesión y forzar el regreso a /login — cubre tanto
 *    "nunca hubo sesión" como "la sesión expiró a la mitad del uso".
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_STORAGE_KEY = "ejixhole_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Callback que AuthContext registra al montar la app, para poder
 * reaccionar a un 401 sin que este archivo (api/client.ts) necesite
 * importar React ni el Context — mantiene la capa de API
 * independiente de la capa de UI.
 */
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // El endpoint de login se excluye a propósito: un 401 ahí significa
    // "contraseña incorrecta" (ya lo maneja LoginPage con su propio
    // mensaje), no "tu sesión expiró" — mostrar ambos sería confuso.
    const esLogin = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !esLogin) {
      clearStoredToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
