"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check, Loader2, Trash2 } from "lucide-react";
import { useNotifications, type NotificationDoc } from "@/app/hooks/notifications/useNotifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/app/hooks/use-theme-client";

export function NotificationsBell() {
  const { theme } = useTheme();
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, deleteMany, isLoading } = useNotifications();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleOpenNotification = async (notification: NotificationDoc) => {
    const { _id, redirectId, read, type } = notification;

    if (!read) {
      await markAsRead(_id);
    }

    if (redirectId) {
      if (type === "ACTIVITY") {
        router.push(`/processes/${redirectId}?tab=activities`);
      } else {
        router.push(`/processes/${redirectId}`);
      }
    }
  };

  const handleMarkAll = async () => {
    if (!unreadCount) return;
    setIsMarkingAll(true);
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
      await Promise.all(unreadIds.map((id) => markAsRead(id)));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleClearRead = async () => {
    const readIds = notifications.filter((n) => n.read).map((n) => n._id);
    if (!readIds.length) return;
    await deleteMany(readIds);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl ${theme === "dark"
              ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:border-gray-500"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          title="Notificações"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-96 max-w-[90vw] rounded-xl shadow-lg border ${theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notificações</span>
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAll}
              disabled={isMarkingAll || unreadCount === 0}
              className="h-7 px-2 text-xs"
            >
              {isMarkingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Marcar lidas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearRead}
              disabled={!notifications.some((n) => n.read)}
              className="h-7 px-2 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Limpar lidas
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">Sem notificações</div>
          )}
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              onClick={() => handleOpenNotification(notification)}
              className={`flex items-start gap-3 cursor-pointer py-3 px-4 focus:outline-none ${
                notification.read
                  ? theme === "dark"
                    ? "bg-transparent text-gray-300 focus:bg-gray-800/30 focus:text-white"
                    : "bg-transparent text-gray-700 focus:bg-blue-50 focus:text-gray-900"
                  : theme === "dark"
                    ? "bg-gray-800/60 text-white focus:bg-gray-800/80 focus:text-white"
                    : "bg-blue-50 text-gray-900 focus:bg-blue-100 focus:text-gray-900"
              }`}
            >
              <div className="mt-0.5">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{notification.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {notification.description}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
              {!notification.read && (
                <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

