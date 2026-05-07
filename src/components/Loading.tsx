"use client";
import { FileText } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message }: LoadingProps) {
  const { theme, mounted } = useTheme();

  // Use a default theme during SSR to avoid hydration mismatch
  const currentTheme = mounted ? theme : "light";

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 
        ${currentTheme === "dark" ? "bg-background text-foreground" : "bg-muted text-muted-foreground"}`}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading overlay */}
        <div
          className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center 
            ${currentTheme === "dark" ? "bg-background/90" : "bg-muted/90"}`}
          suppressHydrationWarning
        >
          <div
            className={`rounded-2xl shadow-2xl p-8 border max-w-md w-full mx-4 
              ${currentTheme === "dark" ? "bg-muted border-border" : "bg-card border-border"}`}
            suppressHydrationWarning
          >
            <div className="text-center">
              {/* Animated spinner */}
              <div className="relative flex justify-center mb-6">
                <div className="w-16 h-16 relative">
                  <div
                    className={`absolute inset-0 rounded-full border-4 
                      ${currentTheme === "dark" ? "border-secondary/30" : "border-secondary/50"}`}
                    suppressHydrationWarning
                  ></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary animate-spin"></div>
                  <div
                    className={`absolute inset-2 rounded-full flex items-center justify-center 
                      ${currentTheme === "dark" ? "bg-secondary/20" : "bg-secondary/10"}`}
                    suppressHydrationWarning
                  >
                    <FileText
                      className={`h-6 w-6 animate-pulse 
                        ${currentTheme === "dark" ? "text-secondary-foreground" : "text-secondary"}`}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>

              {/* Loading text */}
              <h2
                className={`text-xl font-bold mb-2 
                  ${currentTheme === "dark" ? "text-foreground" : "text-muted-foreground"}`}
                suppressHydrationWarning
              >
                {message || "Carregando..."}
              </h2>
              <p
                className={
                  currentTheme === "dark"
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
                }
                suppressHydrationWarning
              >
                Aguarde enquanto buscamos os dados mais recentes.
              </p>

              {/* Progress dots */}
              <div className="flex justify-center space-x-1 mt-6">
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
