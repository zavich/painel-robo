"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { FormDefinition } from "@/app/interfaces/forms";
import { FormFieldPreview } from "@/components/form-builder/FormFieldPreview";
import { iconButtonClass, pillClass } from "@/components/form-builder/styles";

const MAX_VISIBLE_FIELDS = 4;

interface FormCardPreviewProps {
  form: FormDefinition;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function FormCardPreview({
  form,
  onEdit,
  onDelete,
  isDeleting = false,
}: FormCardPreviewProps) {
  const { theme } = useTheme();
  const visibleFields = form.fields.slice(0, MAX_VISIBLE_FIELDS);
  const remaining = form.fields.length - visibleFields.length;

  return (
    <div
      className={`animate-fade-in-up flex flex-col rounded-2xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h4
          className={`truncate text-base font-semibold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {form.name}
        </h4>
        <span className={`${pillClass(theme)} shrink-0`}>
          {form.fields.length} {form.fields.length === 1 ? "campo" : "campos"}
        </span>
      </div>

      <div
        className={`flex-1 rounded-xl border border-dashed p-3 ${
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        }`}
      >
        {visibleFields.length === 0 ? (
          <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            Este formulário ainda não possui campos.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleFields.map((field) => (
              <FormFieldPreview key={field.id} field={field} theme={theme} compact />
            ))}
            {remaining > 0 && (
              <p
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                +{remaining} {remaining === 1 ? "campo" : "campos"}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onEdit}
          disabled={isDeleting}
          className={`${iconButtonClass(theme, "accent")} flex items-center gap-1.5 !px-3 !py-1.5 text-sm font-medium`}
          title="Editar formulário"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className={`${iconButtonClass(theme, "destructive")} flex items-center gap-1.5 !px-3 !py-1.5 text-sm font-medium`}
          title="Excluir formulário"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Removendo..." : "Excluir"}
        </button>
      </div>
    </div>
  );
}
