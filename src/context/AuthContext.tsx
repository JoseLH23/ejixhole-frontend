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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  tieneRol: (rolesPermitidos: Rol[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function decodificarUsuario(token: string): UsuarioActual | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp < Date.now() / 1000) return null;
    return { email: payload.sub, rol: payload.rol as Rol };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<UsuarioActual | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const usuarioRef = React.useRef(usuario);
  usuarioRef.current = usuario;

  /**
   * Completa el perfil del JWT con los datos confiables de `/auth/me`.
   * El ID real permite que Reservaciones, Pagos y Caja dejen de pedirle al
   * operador un número manual que el backend ya conoce por su sesión.
   */
  const cargarPerfilReal = React.useCallback(async () => {
    try {
      const perfil = await authApi.me();
      setUsuario((actual) =>
        actual
          ? {
              ...actual,
              id: perfil.id,
              nombre: perfil.nombre,
              email: perfil.email,
              rol: perfil.rol,
            }
          : actual
      );
    } catch {
      // El interceptor atiende un 401; una falla de red no debe romper una
      // sesión cuyo JWT todavía es válido.
    }
  }, []);

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const usuarioRestaurado = decodificarUsuario(token);
      if (usuarioRestaurado) {
        setUsuario(usuarioRestaurado);
        void cargarPerfilReal();
      } else {
        clearStoredToken();
      }
    }
    setIsLoading(false);
  }, [cargarPerfilReal]);

  React.useEffect(() => {
    registerUnauthorizedHandler(() => {
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
      if (usuarioLogueado) void cargarPerfilReal();
    },
    [cargarPerfilReal]
  );

  const logout = React.useCallback(() => {
    clearStoredToken();
    setUsuario(null);
  }, []);

  const tieneRol = React.useCallback(
    (rolesPermitidos: Rol[]) => (usuario ? rolesPermitidos.includes(usuario.rol) : false),
    [usuario]
  );

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: usuario !== null,
        isLoading,
        login,
        logout,
        tieneRol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
