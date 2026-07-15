// src/app/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClients";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./hooks/user/auth/useAuth";
import { FilterProvider } from "./hooks/filter/useFilter";
import { ThemeProvider } from "./hooks/use-theme-client";
import { NotificationsProvider } from "./hooks/notifications/useNotifications";
import { FormsProvider } from "./hooks/forms/useForms";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <FilterProvider>
              <FormsProvider>
                <ToastContainer
                  hideProgressBar
                  closeOnClick
                  closeButton={false}
                  toastClassName="custom-toast-azulou"
                />
                {children}
              </FormsProvider>
            </FilterProvider>
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
