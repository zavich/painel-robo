import { SigninRequestType, UserType } from "@/app/interfaces/user";

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
   * Faz o login do usuário
   */
  signIn(data: SigninRequestType): Promise<void>;

  /**
   * Faz o logout do usuário
   */
  logout(): void;
}

export interface UserDataType {
  user: UserType;
  token: string | undefined;
}
