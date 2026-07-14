"use client";

import { useParams, useRouter } from "next/navigation";
import { MainShell } from "@/components/layout/MainShell";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { useForms } from "@/app/hooks/forms/useForms";
import { useTheme } from "@/app/hooks/use-theme-client";
import { FileWarning, Pencil } from "lucide-react";
import { primaryButtonClass } from "@/components/form-builder/styles";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const id = params?.id as string;
  const { forms, isReady } = useForms();

  const form = isReady ? forms.find((item) => item.id === id) : undefined;

  if (!isReady) {
    return (
      <MainShell>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-secondary" />
            </div>
          </div>
        </div>
      </MainShell>
    );
  }

  if (!form) {
    return (
      <MainShell>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <FileWarning
                  className={`h-8 w-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                />
              </div>
              <div>
                <p
                  className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
                >
                  Formulário não encontrado
                </p>
                <p
                  className={`mt-1 max-w-sm text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                >
                  Ele pode ter sido removido, ou ainda não foi encontrado
                  no armazenamento local deste navegador.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/forms")}
                className={primaryButtonClass()}
              >
                Voltar para Formulários
              </button>
            </div>
          </div>
        </div>
      </MainShell>
    );
  }

  return (
    <MainShell>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent dark:from-secondary dark:to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Editar Formulário
              </h1>
              <p
                className={`mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Atualize os campos de &quot;{form.name}&quot; e acompanhe o
                resultado em tempo real no preview.
              </p>
            </div>
          </div>

          <FormBuilder initialForm={form} />
        </div>
      </div>
    </MainShell>
  );
}
