import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Gavel, Lock, Mail, Scale, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(255, "E-mail muito longo"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
      await signIn({ email: data.email, password: data.password });
    } catch (error: unknown) {
      const axiosErr = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setLoginError(
        axiosErr?.response?.data?.message ||
          axiosErr?.message ||
          "Erro ao fazer login.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary shadow-md">
            <Scale className="h-8 w-8 text-secondary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Juri Capital</h1>

        <p className="text-sm text-muted-foreground">Acesse sua conta</p>
      </div>

      {loginError && (
        <div className="mb-6 p-4 rounded-xl border border-destructive bg-destructive/10 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="space-y-2">
          <Label className="text-sm text-foreground">Senha</Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />

            <Input
              {...register("password")}
              type="password"
              placeholder="Sua senha"
              autoComplete="current-password"
              className={cn(
                "pl-10 h-11 bg-white/70 border border-white/30 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-secondary/60",
                errors.password && "border-destructive",
              )}
            />
          </div>

          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox {...register("rememberMe")} />
            <Label className="text-muted-foreground">Lembrar-me</Label>
          </div>
        </div>

        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading || !isValid}
          className="w-full h-11 font-semibold shadow-md shadow-secondary/30 hover:shadow-lg hover:-translate-y-[1px] transition-all"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-white/20" />
        <span className="px-3 text-xs text-gray-500">ou</span>
        <div className="flex-1 border-t border-white/20" />
      </div>

      <Button
        variant="outline"
        className="w-full border-white/30 text-gray-800 hover:bg-white/60 "
      >
        Solicitar acesso
      </Button>

      <div className="mt-6 grid grid-cols-2 gap-3">
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
