"use client";

import { useTheme } from "@/app/hooks/use-theme-client";
import { ReactNode } from "react";

interface ThemeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ThemeWrapper({ children, fallback = null }: ThemeWrapperProps) {
  const { mounted } = useTheme();

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
