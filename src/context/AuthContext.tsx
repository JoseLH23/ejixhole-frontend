import * as React from "react";

import { authApi } from "@/api/auth";
import { registerUnauthorizedHandler } from "@/api/client";
import { useToast } from "@/components/ui/toast-provider";
import type { Rol, UsuarioActual, UsuarioMe } from "@/types/auth";

interface AuthContextValue {
  usuario: UsuarioActual | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  tieneRol: (rolesPermitidos: Rol[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function usuarioDesdePerfil(perfil: UsuarioMe): UsuarioActual {
  return {
    id: perfil.id,
    nombre: perfil.nombre,
    email: perfil.email,
    rol: perfil.rol,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = React.useState<UsuarioActual | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const usuarioRef = React.useRef(usuario);
  usuarioRef.current = usuario;

  // Restaurar sesión significa preguntarle al servidor. El navegador puede
  // enviar la cookie HttpOnly, pero JavaScript nunca puede leer el JWT.
  React.useEffect(() => {
    let activo = true;

    const restaurarSesion = async () => {
      try {
        const perfil = await authApi.me();
        if (activo) setUsuario(usuarioDesdePerfil(perfil));
      } catch {
        if (activo) setUsuario(null);
      } finally {
        if (activo) setIsLoading(false);
      }
    };

    void restaurarSesion();
    return () => {
      activo = false;
    };
  }, []);

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

  const login = React.useCallback(async (email: string, password: string) => {
    await authApi.login({ email, password });
    const perfil = await authApi.me();
    setUsuario(usuarioDesdePerfil(perfil));
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
      setUsuario(null);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setUsuario(null);
        return;
      }
      toast({
        title: "No se pudo cerrar la sesión",
        description: "Revisa tu conexión e inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
