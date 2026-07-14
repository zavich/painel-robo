"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ClipboardList, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FormCardPreview } from "@/components/form-builder/FormCardPreview";
import { useForms } from "@/app/hooks/forms/useForms";
import { useTheme } from "@/app/hooks/use-theme-client";
import { FormDefinition } from "@/app/interfaces/forms";

export function FormsList() {
  const router = useRouter();
  const { theme } = useTheme();
  const { forms, deleteForm } = useForms();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormDefinition | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deleteForm(deleteTarget.id);
    toast.success("Formulário removido com sucesso (simulação)");
    setDeleteTarget(null);
  };

  return (
    <section className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent dark:from-secondary dark:to-accent rounded-2xl flex items-center justify-center shadow-lg">
          <ClipboardList className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Formulários
          </h2>
          <p
            className={`mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Monte formulários dinâmicos e gerencie os já criados
          </p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex justify-end mb-6">
        <Button
          className="bg-gradient-to-r from-secondary to-accent text-white hover:from-secondary hover:to-accent h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => router.push("/dashboard/forms/new")}
        >
          <Plus className="h-5 w-5 mr-2 text-white" />
          Novo Formulário
        </Button>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div
          className={`rounded-2xl shadow-lg border py-16 text-center ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FileText
                className={`h-8 w-8 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p
                className={`font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Nenhum formulário criado ainda
              </p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Clique em &quot;Novo Formulário&quot; para montar o primeiro
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => (
            <FormCardPreview
              key={form.id}
              form={form}
              onEdit={() => router.push(`/dashboard/forms/${form.id}`)}
              onDelete={() => setDeleteTarget(form)}
              isDeleting={deletingId === form.id}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remover formulário"
        description={`Tem certeza que deseja remover o formulário "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={deletingId !== null}
      />
    </section>
  );
}
