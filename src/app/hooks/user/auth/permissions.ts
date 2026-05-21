import type { UserType } from "@/app/interfaces/user";

export function hasUserPermission(
  user: Pick<UserType, "permissions"> | null | undefined,
  key: string,
) {
  return Boolean(user?.permissions?.includes(key));
}
