import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Scale, Shield, Gavel } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SigninRequestType } from "@/app/interfaces/user";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { useTheme } from "@/app/hooks/use-theme-client";
import { cn } from "@/lib/utils";

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
  const { theme } = useTheme();

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
  const watchedPassword = watch("password");
  const watchedRememberMe = watch("rememberMe");

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    
    if (savedEmail && savedRememberMe) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  // Salvar/remover dados do localStorage baseado no checkbox
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
      await signIn({ 
        email: data.email, 
        password: data.password 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Erro ao fazer login. Verifique suas credenciais.";
      
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Validação em tempo real para feedback visual
  const getFieldStatus = (fieldName: keyof LoginFormData) => {
    if (errors[fieldName]) return "error";
    if (isDirty && !errors[fieldName]) return "success";
    return "default";
  };

  return (
    <div className={`w-full max-w-md mx-auto ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-800/50"} backdrop-blur-sm rounded-2xl border shadow-2xl p-8 ${
      theme === "dark" 
        ? "border-gray-700" 
        : "border-gray-700"
    }`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
            theme === "dark" 
              ? "bg-gradient-to-br from-blue-500 to-purple-600" 
              : "bg-gradient-to-br from-blue-500 to-purple-600"
          }`}>
            <Scale className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-100">
          Prosolutti
        </h1>
        <p className="text-sm text-gray-400">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>

      {/* Error Message */}
      {loginError && (
        <div className="mb-6 p-4 rounded-xl border flex items-center space-x-3 bg-red-900/20 border-red-800">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-300">
            {loginError}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-sm font-semibold text-gray-100"
          >
            E-mail
          </Label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              getFieldStatus("email") === "error" 
                ? "text-red-500" 
                : "text-gray-400"
            }`} />
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="seu@email.com"
              className={`pl-10 h-11 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500 ${
                getFieldStatus("email") === "error" 
                  ? "border-red-500 focus:ring-red-500/20" 
                  : ""
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs">{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="password" 
            className="text-sm font-semibold text-gray-100"
          >
            Senha
          </Label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              getFieldStatus("password") === "error" 
                ? "text-red-500" 
                : "text-gray-400"
            }`} />
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className={`pl-10 pr-10 h-11 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500/20 focus:border-blue-500 ${
                getFieldStatus("password") === "error" 
                  ? "border-red-500 focus:ring-red-500/20" 
                  : ""
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 disabled:opacity-50 text-gray-400 hover:text-gray-300"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs">{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Checkbox
              {...register("rememberMe")}
              id="remember"
              className="w-4 h-4"
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer select-none font-medium transition-colors text-gray-300 hover:text-gray-200"
            >
              Lembrar-me
            </Label>
          </div>
          <a
            href="#"
            className="font-semibold transition-colors duration-200 hover:underline text-blue-400 hover:text-blue-300"
          >
            Esqueci minha senha
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading || !isValid}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Entrando...</span>
            </div>
          ) : (
            "Entrar na Conta"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-8">
        <div className="relative border-gray-700">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">
              ou
            </span>
          </div>
        </div>
      </div>

      {/* Request Access */}
      <div className="text-center">
        <p className="text-sm mb-4 text-gray-400">
          Ainda não possui uma conta?
        </p>
        <Button
          variant="outline"
          className="w-full h-10 font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.98] border-gray-600 text-gray-300 hover:bg-gray-700"
          disabled={isLoading}
        >
          Solicitar Acesso
        </Button>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-medium text-gray-300">
            Seguro
          </span>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
          <Gavel className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-medium text-gray-300">
            Confiável
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
