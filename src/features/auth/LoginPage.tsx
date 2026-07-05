import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Waves, Leaf, ArrowRight } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkIllustration } from "@/components/brand/ParkIllustration";

const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu email").email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Rediseño total (Entrega 6): split-screen, inspirado en pantallas de
 * login de Linear/Stripe/Vercel — un panel hero grande con la
 * identidad de marca (degradado animado + ilustración propia de la
 * selva/cascada) y el formulario en un panel limpio y minimalista al
 * lado, no una tarjeta flotando sobre un fondo tenue como antes.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setErrorGeneral(null);
    try {
      await login(values.email, values.password);
      const destino = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(destino, { replace: true });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setErrorGeneral("Email o contraseña incorrectos.");
      } else if (error?.response?.status === 403) {
        setErrorGeneral("Este usuario está desactivado.");
      } else {
        setErrorGeneral("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Panel hero — solo desktop, es la pieza de marca más grande de toda la app */}
      <div className="gradient-mesh-hero dot-grid relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Waves className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">EjiXhole</span>
        </div>

        <div className="relative z-10 max-w-md animate-fade-in-up">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Leaf className="h-3 w-3" /> Experience OS
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            La selva y el agua, ahora también en tu operación diaria.
          </h1>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Reservaciones, pagos, caja y reportes del parque — todo en un solo lugar,
            hecho a la medida de EjiXhole.
          </p>
        </div>

        <ParkIllustration className="pointer-events-none absolute inset-x-0 bottom-0 h-64 w-full opacity-90" />
      </div>

      {/* Panel de formulario */}
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Waves className="h-6 w-6" />
            </div>
            <p className="font-display text-xl font-semibold">EjiXhole</p>
          </div>

          <h2 className="font-display text-2xl font-semibold">Bienvenido de vuelta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para continuar con tu operación.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="tu@ejixhole.com"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {errorGeneral && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorGeneral}
              </p>
            )}

            <Button type="submit" className="w-full group" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
              {!isSubmitting && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
