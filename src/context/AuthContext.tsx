import * as React from "react";
import { jwtDecode } from "jwt-decode";

import { authApi } from "@/api/auth";
import {
  clearStoredToken,
  getStoredToken,
  registerUnauthorizedHandler,
  setStoredToken,
} from "@/api/client";
import { useToast } from "@/components/ui/toast-provider";
import type { JwtPayload, Rol, UsuarioActual } from "@/types/auth";

interface AuthContextValue {
  usuario: UsuarioActual | null;
  isAuthenticated: boolean;
  /** true mientras se intenta restaurar la sesión desde localStorage al cargar la app */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** true si el rol actual está en la lista dada — para RequireRole y el Sidebar */
  tieneRol: (rolesPermitidos: Rol[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function decodificarUsuario(token: string): UsuarioActual | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);

    // Solo lectura del payload — la verificación de firma/expiración
    // real la sigue haciendo el backend en cada request. Aquí solo se
    // usa exp para decidir si vale la pena restaurar la sesión sin
    // esperar a que el backend responda 401.
    const ahora = Date.now() / 1000;
    if (payload.exp < ahora) {
      return null;
    }

    return { email: payload.sub, rol: payload.rol as Rol };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<UsuarioActual | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  // Se usa una ref (no el estado directo) dentro del handler de 401
  // porque ese handler se registra una sola vez (ver useEffect de
  // abajo) — sin la ref, quedaría atado al valor de `usuario` del
  // primer render (null), y nunca sabría si en verdad había una
  // sesión activa que expiró.
  const usuarioRef = React.useRef(usuario);
  usuarioRef.current = usuario;

  /**
   * Trae el nombre real (GET /auth/me) y lo aplica al usuario ya en
   * sesión, sin bloquear login ni restauración — email/rol del JWT ya
   * son suficientes para que RequireAuth/RequireRole funcionen de
   * inmediato. Si /me falla (red, etc.), el usuario simplemente se
   * queda sin `nombre` y los componentes usan el fallback documentado
   * en lib/nombreUsuario.ts — nunca rompe la sesión.
   */
  const cargarNombreReal = React.useCallback(async () => {
    try {
      const perfil = await authApi.me();
      setUsuario((actual) => (actual ? { ...actual, nombre: perfil.nombre } : actual));
    } catch {
      // Silencioso a propósito: si el token ya expiró, el interceptor
      // de 401 se encarga de cerrar sesión por su cuenta.
    }
  }, []);

  // Al montar la app: si hay un token guardado y no expiró, restaura
  // la sesión sin pedirle credenciales de nuevo al usuario.
  React.useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const usuarioRestaurado = decodificarUsuario(token);
      if (usuarioRestaurado) {
        setUsuario(usuarioRestaurado);
        void cargarNombreReal();
      } else {
        clearStoredToken();
      }
    }
    setIsLoading(false);
  }, [cargarNombreReal]);

  // El interceptor de Axios (api/client.ts) no puede importar este
  // Context directamente (evita acoplar la capa de API a React), así
  // que le registra un callback simple para cuando llegue un 401.
  React.useEffect(() => {
    registerUnauthorizedHandler(() => {
      // Solo avisa "tu sesión expiró" si de verdad había una sesión —
      // evita un toast confuso si el 401 llega sin que el usuario
      // hubiera iniciado sesión nunca (ej. una llamada perdida).
      if (usuarioRef.current !== null) {
        toast({
          title: "Sesión expirada",
          description: "Vuelve a iniciar sesión para continuar.",
          variant: "info",
        });
      }
      setUsuario(null);
    });
  }, [toast]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { access_token } = await authApi.login({ email, password });
      setStoredToken(access_token);
      const usuarioLogueado = decodificarUsuario(access_token);
      setUsuario(usuarioLogueado);
      if (usuarioLogueado) void cargarNombreReal();
    },
    [cargarNombreReal]
  );

  const logout = React.useCallback(() => {
    clearStoredToken();
    setUsuario(null);
  }, []);

  const tieneRol = React.useCallback(
    (rolesPermitidos: Rol[]) => (usuario ? rolesPermitidos.includes(usuario.rol) : false),
    [usuario]
  );

  const value: AuthContextValue = {
    usuario,
    isAuthenticated: usuario !== null,
    isLoading,
    login,
    logout,
    tieneRol,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
