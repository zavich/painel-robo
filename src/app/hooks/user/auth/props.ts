import { UserType } from "@/app/interfaces/user";

export interface AuthContextType {
  /**
   * Status da request
   */

  /**
   * Informações do usuário
   */
  user: UserType;

  /**
   * Informações do usuário
   */
  setUser: (value: UserType) => void;

  /**
   * Determina se o usuário está autenticado ou não
   */
  isAuthenticated: boolean;

  /**
   * Indica se a checagem inicial de autenticação (/auth/me) ainda está em andamento
   */
  isLoading: boolean;

  /**
   * Faz o logout do usuário
   */
  logout(): void;

  /**
   * Verifica se o usuário possui uma permissão específica
   */
  hasPermission(key: string): boolean;
}

export interface UserDataType {
  user: UserType;
  token: string | undefined;
}
