import { useTheme } from "@/app/hooks/use-theme-client";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Gavel,
  Lock,
  Mail,
  Scale,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema de validação
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
  rememberMe: z.boolean().optional(),
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
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const watchedEmail = watch("email");
  const watchedRememberMe = watch("rememberMe");

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedRememberMe) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  useEffect(() => {
    if (watchedRememberMe && watchedEmail) {
      localStorage.setItem("rememberedEmail", watchedEmail);
      localStorage.setItem("rememberMe", "true");
    } else if (!watchedRememberMe) {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberMe");
    }
  }, [watchedRememberMe, watchedEmail]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);
    clearErrors();

    try {
      await signIn(data);
    } catch (error: any) {
      setLoginError(
        error?.response?.data?.message ||
          error?.message ||
          "Erro ao fazer login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl shadow-xl p-8">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary shadow-md">
            <Scale className="h-8 w-8 text-secondary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Juri Capital</h1>

        <p className="text-sm text-muted-foreground">Acesse sua conta</p>
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
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              {...register("email")}
              placeholder="seu@email.com"
              className={cn(
                "pl-10 h-11 bg-muted border-border text-foreground focus-visible:ring-2 focus-visible:ring-secondary",
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
          <Label className="text-sm text-foreground">Senha</Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className={cn(
                "pl-10 pr-10 h-11 bg-muted border-border text-foreground focus-visible:ring-2 focus-visible:ring-secondary",
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

        {/* REMEMBER */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox {...register("rememberMe")} />
            <Label className="text-muted-foreground">Lembrar-me</Label>
          </div>

          <a className="text-secondary hover:underline cursor-pointer">
            Esqueci minha senha
          </a>
        </div>

        {/* BUTTON */}
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full h-11 font-semibold bg-secondary text-secondary-foreground hover:brightness-95 transition"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {/* DIVIDER */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs text-muted-foreground">ou</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* ACTION */}
      <Button
        variant="outline"
        className="w-full border-border text-foreground hover:bg-muted"
      >
        Solicitar acesso
      </Button>

      {/* FEATURES */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted">
          <Shield className="h-4 w-4 text-secondary" />
          <span className="text-xs text-muted-foreground">Seguro</span>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted">
          <Gavel className="h-4 w-4 text-secondary" />
          <span className="text-xs text-muted-foreground">Confiável</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
