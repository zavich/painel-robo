"use client";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { AuthContextType } from "./props";
import { UserType } from "@/app/interfaces/user";
import api from "@/app/api";
import { AxiosError } from "axios";
import { logger } from "@/app/lib/logger";
import Cookies from "js-cookie";
import { hasUserPermission } from "./permissions";

export const AuthContext = createContext({} as AuthContextType);
export interface AuthProviderProps {
  children: ReactNode; // Define children como um ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [user, setUser] = useState<UserType>({} as UserType);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const clearAuthCookies = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("prosolutti_accessToken");
  };

  useEffect(() => {
    const bootstrapSsoSession = async () => {
      try {
        // SSO + JIT provisioning: criar usuário é uma escrita, então fica num
        // POST explícito. O GET /auth/me virou somente-leitura e retorna 401 se
        // o usuário ainda não existe na robo-api. Chamamos /auth/sso/session uma
        // única vez no bootstrap: provisiona (se necessário) e devolve o perfil
        // (mesmo shape do /auth/me, idempotente se o usuário já existe).
        const { data } = await api.post("/auth/sso/session");
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        if (axiosError.response?.status === 429) {
          // Rate limit (10 req/min): NÃO derrubar a sessão. Múltiplas abas
          // recarregando podem estourar o limite mesmo com um cookie válido —
          // limpar cookies/redirecionar aqui faria logout indevido. Apenas
          // avisamos e mantemos o estado para um novo retry no próximo load.
          toast.warn(
            "Muitas tentativas de autenticação. Aguarde um instante e atualize a página.",
          );
          return;
        }

        if (axiosError.response?.data?.message === "Conta desativada") {
          toast.error(
            "Sua conta está desativada. Procure um administrador para reativá-la.",
          );
        }

        // Limpar cookies e estado em caso de erro de autenticação
        clearAuthCookies();
        setUser({} as UserType);
        setIsAuthenticated(false);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSsoSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      logger.warn("Erro ao fazer logout no servidor:", error as object);
      toast.warn(
        "Logout parcial: a sessão no servidor pode não ter sido encerrada. Feche o navegador para garantir.",
      );
    } finally {
      // Sempre limpar o estado local e redirecionar
      clearAuthCookies();
      setIsAuthenticated(false);
      setUser({} as UserType);
      router.replace("/login");
    }
  };
  const hasPermission = useCallback(
    (key: string) => hasUserPermission(user, key),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoading,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
};
