"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ClipboardList, FileText, Send } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { useForms } from "@/app/hooks/forms/useForms";
import { useSubmitForm } from "@/app/hooks/forms/useSubmitForm";
import { FormFillField, FormFillValue } from "@/components/form-builder/FormFillField";
import { FormDefinition } from "@/app/interfaces/forms";
import {
  labelClass,
  mutedTextClass,
  pillClass,
  primaryButtonClass,
} from "@/components/form-builder/styles";

const SIDEBAR_BG =
  "bg-gradient-to-b from-primary via-primary to-primary-light dark:from-sidebar-background dark:via-sidebar-background dark:to-sidebar-background";

function readFormIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("formId");
}

function setFormIdInUrl(formId: string | null) {
  const url = formId ? `/forms/fill?formId=${formId}` : "/forms/fill";
  window.history.pushState(null, "", url);
}

export default function FillFormPage() {
  const { theme } = useTheme();
  const { forms, isReady } = useForms();
  const { submitForm, isSubmitting } = useSubmitForm();
  const [mounted, setMounted] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, FormFillValue>>({});

  useEffect(() => {
    setFormId(readFormIdFromUrl());
    setMounted(true);

    const handlePopState = () => setFormId(readFormIdFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const selectedForm = forms.find((form) => form.id === formId) ?? null;

  const handleSelectForm = (form: FormDefinition) => {
    setFormId(form.id);
    setAnswers({});
    setFormIdInUrl(form.id);
  };

  const handleBackToPicker = () => {
    setFormId(null);
    setAnswers({});
    setFormIdInUrl(null);
  };

  const handleFieldChange = (fieldId: string, value: FormFillValue) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedForm) return;

    const missingRequired = selectedForm.fields.filter((field) => {
      if (!field.required) return false;
      if (field.type === "checkbox") return answers[field.id] !== true;
      const value = answers[field.id];
      return typeof value !== "string" || value.trim() === "";
    });

    if (missingRequired.length > 0) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await submitForm({
        formId: selectedForm.id,
        answers: selectedForm.fields.map((field) => ({
          label: field.label,
          type: field.type,
          value: answers[field.id] ?? (field.type === "checkbox" ? false : ""),
        })),
      });
      toast.success("Formulário enviado com sucesso");
      setAnswers({});
    } catch {
      toast.error("Não foi possível enviar o formulário. Tente novamente.");
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${SIDEBAR_BG}`}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <ClipboardList className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Preenchimento de Formulário
            </h1>
            <p className="text-sm text-white/70">
              {selectedForm
                ? selectedForm.name
                : "Selecione um formulário para preencher"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/95 sm:p-8">
          {!selectedForm ? (
            !isReady ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className={`text-sm ${mutedTextClass(theme)}`}>
                  Carregando formulários...
                </p>
              </div>
            ) : forms.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText
                  className={`h-10 w-10 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                />
                <p
                  className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                >
                  Nenhum formulário disponível
                </p>
                <p className={`text-sm ${mutedTextClass(theme)}`}>
                  Crie um formulário em &quot;Formulários&quot; para poder
                  preenchê-lo aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className={labelClass(theme)}>Escolha um formulário</p>
                {forms.map((form) => (
                  <button
                    key={form.id}
                    type="button"
                    onClick={() => handleSelectForm(form)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700/40"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                    >
                      {form.name}
                    </span>
                    <span className={pillClass(theme)}>
                      {form.fields.length}{" "}
                      {form.fields.length === 1 ? "campo" : "campos"}
                    </span>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              <button
                type="button"
                onClick={handleBackToPicker}
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Escolher outro formulário
              </button>

              <div className="space-y-5">
                {selectedForm.fields.map((field) => (
                  <FormFillField
                    key={field.id}
                    field={field}
                    theme={theme}
                    value={
                      answers[field.id] ?? (field.type === "checkbox" ? false : "")
                    }
                    onChange={(value) => handleFieldChange(field.id, value)}
                  />
                ))}
              </div>

              <div
                className={`flex justify-end border-t pt-6 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`${primaryButtonClass()} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
