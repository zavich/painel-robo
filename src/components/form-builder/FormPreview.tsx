"use client";

import { Eye } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { FormField } from "@/app/interfaces/forms";
import { FormFieldPreview } from "@/components/form-builder/FormFieldPreview";
import {
  mutedTextClass,
  sectionCardClass,
  sectionIconClass,
  sectionTitleClass,
} from "@/components/form-builder/styles";

interface FormPreviewProps {
  name: string;
  fields: FormField[];
}

export function FormPreview({ name, fields }: FormPreviewProps) {
  const { theme } = useTheme();

  return (
    <div className={`sticky top-4 ${sectionCardClass(theme)}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={sectionIconClass()}>
          <Eye className="h-4 w-4 text-white" />
        </div>
        <h3 className={sectionTitleClass(theme)}>Preview</h3>
      </div>

      <div
        className={`rounded-xl border border-dashed p-4 ${
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        }`}
      >
        <h4
          className={`mb-4 text-lg font-semibold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {name || "Nome do formulário"}
        </h4>

        {fields.length === 0 ? (
          <p className={`text-sm ${mutedTextClass(theme)}`}>
            Adicione campos para visualizar o formulário aqui.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <FormFieldPreview key={field.id} field={field} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
