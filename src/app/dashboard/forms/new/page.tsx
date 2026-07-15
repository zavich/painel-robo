"use client";

import { FilePlus2 } from "lucide-react";
import { MainShell } from "@/components/layout/MainShell";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { useTheme } from "@/app/hooks/use-theme-client";

export default function NewFormPage() {
  const { theme } = useTheme();

  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent dark:from-secondary dark:to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <FilePlus2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Criar Formulário
              </h1>
              <p
                className={`mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Monte um formulário dinâmico adicionando campos
                personalizados e acompanhe o resultado em tempo real no
                preview.
              </p>
            </div>
          </div>

          <FormBuilder />
        </div>
      </div>
    </MainShell>
  );
}
