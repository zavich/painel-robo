export enum UserRolesEnum {
  ADMIN = "admin",
  LAWYER = "advogado",
}
export interface UserType {
  _id: string;
  name: string;
  contact: string;
  email: string;
  isActive: boolean;
  role: UserRolesEnum;
  permissions?: string[];
}

export interface SigninRequestType {
  email: string;
  password: string;
  rememberMe?: boolean;
}
