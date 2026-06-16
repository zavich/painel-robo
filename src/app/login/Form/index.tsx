"use client";

import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Gavel, Lock, Mail, Scale, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(255, "E-mail muito longo"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      await signIn(data);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Erro ao fazer login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary shadow-md">
            <Scale className="h-8 w-8 text-secondary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Juri Capital</h1>

        <p className="text-sm text-muted-foreground">Acesse sua conta</p>

        <p className="mt-2 text-xs font-medium text-secondary">
          Login de desenvolvimento
        </p>
      </div>

      {/* ERROR */}
      {loginError && (
        <div className="mb-6 p-4 rounded-xl border border-destructive bg-destructive/10 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{loginError}</p>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* EMAIL */}
        <div className="space-y-2">
          <Label className="text-sm text-foreground">E-mail</Label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />

            <Input
              {...register("email")}
              placeholder="seu@email.com"
              className={cn(
                "pl-10 h-11 bg-white/70 border border-white/30 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-secondary/60",
                errors.email && "border-destructive",
              )}
            />
          </div>

          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-800">Senha</Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />

            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className={cn(
                "pl-10 h-11 bg-white/70 border border-white/30 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-secondary/60",
                errors.password && "border-destructive",
              )}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading || !isValid}
          className="w-full h-11 font-semibold shadow-md shadow-secondary/30 hover:shadow-lg hover:-translate-y-[1px] transition-all"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {/* FEATURES */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg border border-white/20 bg-white/60 backdrop-blur-sm">
          <Shield className="h-4 w-4 text-secondary" />
          <span className="text-xs text-gray-700">Seguro</span>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg border border-white/20 bg-white/60 backdrop-blur-sm">
          <Gavel className="h-4 w-4 text-secondary" />
          <span className="text-xs text-gray-700">Confiável</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
