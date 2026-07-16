import axios from "axios";

const API_BASE_URL = import.meta.env.PROD ? "/api" : import.meta.env.VITE_API_BASE_URL;
const CSRF_COOKIE_NAME = "ejixhole_csrf";
const METODOS_SEGUROS = new Set(["get", "head", "options"]);

function leerCookie(nombre: string): string | null {
  if (typeof document === "undefined") return null;
  const prefijo = `${encodeURIComponent(nombre)}=`;
  const entrada = document.cookie
    .split(";")
    .map((valor) => valor.trim())
    .find((valor) => valor.startsWith(prefijo));
  return entrada ? decodeURIComponent(entrada.slice(prefijo.length)) : null;
}

/**
 * Cliente central del panel.
 *
 * La sesión viaja exclusivamente mediante cookie HttpOnly. JavaScript no
 * recibe, decodifica ni persiste el JWT. En producción `/api` se reescribe
 * desde Vercel hacia Render para que la cookie permanezca first-party.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const metodo = config.method?.toLowerCase() ?? "get";
  if (!METODOS_SEGUROS.has(metodo)) {
    const csrf = leerCookie(CSRF_COOKIE_NAME);
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
  }
  return config;
});

/** Callback registrado por AuthContext para reaccionar a una sesión expirada. */
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !esLogin) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
