import { useState } from "react";
import { UserCheck, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAssignableUsers } from "@/app/api/hooks/users/useAssignableUsers";
import { useAssignProcessOwner } from "@/app/api/hooks/process/useAssignProcessOwner";
import { toast } from "@/app/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/hooks/use-theme-client";

interface ProcessOwnerSelectorProps {
  processId: string;
  currentOwnerEmail?: string;
  onSuccess?: () => void;
}

export function ProcessOwnerSelector({
  processId,
  currentOwnerEmail,
  onSuccess,
}: ProcessOwnerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { theme } = useTheme();

  const { data: usersData, isLoading: loadingUsers } = useAssignableUsers();
  const assignOwnerMutation = useAssignProcessOwner();

  const users = usersData?.users || [];

  const maxDisplayUsers = 50;

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const displayUsers = filteredUsers.slice(0, maxDisplayUsers);
  const hasMoreUsers = filteredUsers.length > maxDisplayUsers;

  const handleAssign = async (userId: string) => {
    if (!userId) return;

    try {
      await assignOwnerMutation.mutateAsync({
        processId,
        userId,
      });

      toast({
        title: "Sucesso",
        description: "Responsável atribuído com sucesso!",
      });

      setIsOpen(false);
      setSearchValue("");
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atribuir responsável. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getCurrentUserName = () => {
    if (!currentOwnerEmail) return "Não atribuído";
    const currentUser = users.find((user) => user.email === currentOwnerEmail);
    return currentUser?.email || currentOwnerEmail;
  };

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full h-auto py-1 px-2 text-xs border-none bg-transparent hover:bg-muted/50 focus:ring-1 focus:ring-primary justify-start"
            disabled={loadingUsers || assignOwnerMutation.isPending}
          >
            <div className="flex items-center gap-1 truncate w-full">
              <UserCheck className={`h-3 w-3 flex-shrink-0 ${
                theme === "dark" ? "text-gray-400" : "text-muted-foreground"
              }`} />
              <span className={`flex-shrink-0 ${
                theme === "dark" ? "text-gray-400" : "text-muted-foreground"
              }`}>
                Atribuído a:
              </span>
              <span className={`font-medium truncate min-w-0 ${
                theme === "dark" ? "text-blue-400" : "text-primary"
              }`}>
                {getCurrentUserName()}
              </span>
              <ChevronsUpDown className="ml-auto h-3 w-3 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex flex-col">
            <div className={`flex items-center border-b px-3 ${
              theme === "dark" ? "border-gray-700" : "border-border"
            }`}>
              <input
                type="text"
                placeholder="Pesquisar usuários..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  theme === "dark" 
                    ? "placeholder:text-gray-400 text-gray-100" 
                    : "placeholder:text-muted-foreground"
                }`}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              {loadingUsers ? (
                <div className="py-6 text-center text-sm">
                  <div className="flex items-center justify-center">
                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${
                      theme === "dark" ? "border-blue-400" : "border-primary"
                    }`} />
                    <span className={theme === "dark" ? "text-gray-300" : ""}>
                      Carregando usuários...
                    </span>
                  </div>
                </div>
              ) : displayUsers.length === 0 ? (
                <div className={`py-6 text-center text-sm ${
                  theme === "dark" ? "text-gray-300" : ""
                }`}>
                  Nenhum usuário encontrado.
                </div>
              ) : (
                <div className="p-1">
                  {displayUsers.map((user, index) => (
                    <div
                      key={user.email || `user-${index}`}
                      onClick={() => handleAssign(user.id)}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        assignOwnerMutation.isPending &&
                          "pointer-events-none opacity-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentOwnerEmail === user.email
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col items-start flex-1">
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-100" : ""
                          }`}>{user.email}</span>
                          {typeof user.totalProcesses === "number" && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              theme === "dark" 
                                ? "bg-blue-900/30 text-blue-400" 
                                : "bg-primary/10 text-primary"
                            }`}>
                              {user.totalProcesses}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs capitalize ${
                          theme === "dark" ? "text-gray-400" : "text-muted-foreground"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                  {hasMoreUsers && (
                    <div
                      key="more-users-info" // ✅ Adicionar key para este elemento também
                      className={`text-xs text-center w-full px-2 py-1.5 ${
                        theme === "dark" ? "text-gray-400" : "text-muted-foreground"
                      }`}
                    >
                      Mostrando {displayUsers.length} de {filteredUsers.length}{" "}
                      usuários.
                      {searchValue
                        ? " Use a pesquisa para filtrar mais."
                        : " Digite para pesquisar."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
