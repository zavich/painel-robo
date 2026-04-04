"use client";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { AuthContextType } from "./props";
import { SigninRequestType, UserType } from "@/app/interfaces/user";
import api from "@/app/api";
import Cookies from "js-cookie"; // Adicione esta importação

export const AuthContext = createContext({} as AuthContextType);
export interface AuthProviderProps {
  children: ReactNode; // Define children como um ReactNode
}
export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [user, setUser] = useState<UserType>({} as UserType);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  const clearAuthCookies = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
  };

  const signIn = async (data: SigninRequestType) => {
    try {
      clearAuthCookies();
      await api.post("/auth/login", data);
      const { data: userData } = await api.get("/auth/me");
      setIsAuthenticated(true);
      setUser(userData);
      router.replace("/");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const errorMessage =
          (axiosError.response.data as { message: string })?.message ||
          "Falha ao fazer login.";
        // toast.error(errorMessage);
        // Re-lançar o erro para que o formulário possa capturar
        throw new Error(errorMessage);
      } else if (axiosError.request) {
        const errorMessage = "Não foi possível conectar ao servidor.";
        // toast.error(errorMessage);
        throw new Error(errorMessage);
      } else {
        // toast.error(axiosError.message);
        throw new Error(axiosError.message);
      }
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        setIsAuthenticated(true);
        // router.replace("/");
      } catch (error) {
        // Limpar cookies e estado em caso de erro de autenticação
        clearAuthCookies();
        setUser({} as UserType);
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Mesmo se o logout falhar no servidor, limpar o estado local
      console.warn("Erro ao fazer logout no servidor:", error);
    } finally {
      // Sempre limpar o estado local e redirecionar
      clearAuthCookies();
      setIsAuthenticated(false);
      setUser({} as UserType);
      router.replace("/login");
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        signIn,
        logout,
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
