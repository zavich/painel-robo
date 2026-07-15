"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/app/hooks/use-theme-client";
import { maskCurrencyInput } from "@/app/utils/masks";
import { OptionsEditor } from "@/components/form-builder/OptionsEditor";
import {
  FIELD_TYPE_OPTIONS,
  FieldType,
  FormField,
  fieldTypeHasOptions,
} from "@/app/interfaces/forms";
import {
  checkboxClass,
  dialogContentClass,
  inputClass,
  labelClass,
  mutedTextClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionIconClass,
} from "@/components/form-builder/styles";

interface FieldEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FormField | null;
  onSave: (field: FormField) => void;
}

function buildDraft(field: FormField | null): FormField {
  if (field) return { ...field, options: field.options ? [...field.options] : undefined };
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: [],
  };
}

export function FieldEditor({ open, onOpenChange, field, onSave }: FieldEditorProps) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState<FormField>(() => buildDraft(field));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(buildDraft(field));
      setError(null);
    }
  }, [open, field]);

  const showOptions = fieldTypeHasOptions(draft.type);

  const handleTypeChange = (type: FieldType) => {
    setDraft((prev) => ({
      ...prev,
      type,
      options: fieldTypeHasOptions(type) ? (prev.options?.length ? prev.options : [""]) : undefined,
    }));
  };

  const handleSave = () => {
    const label = draft.label.trim();
    if (!label) {
      setError("Informe o nome do campo.");
      return;
    }

    if (showOptions) {
      const cleanedOptions = (draft.options ?? []).map((o) => o.trim()).filter(Boolean);
      if (cleanedOptions.length === 0) {
        setError("Adicione ao menos uma opção.");
        return;
      }
      onSave({ ...draft, label, options: cleanedOptions });
      return;
    }

    onSave({ ...draft, label, options: undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClass(theme)}>
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={sectionIconClass()}>
              <ListChecks className="h-4 w-4 text-white" />
            </div>
            <DialogTitle
              className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
            >
              {field ? "Editar campo" : "Novo campo"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="field-label" className={labelClass(theme)}>
              Nome do campo
            </label>
            <input
              id="field-label"
              value={draft.label}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, label: e.target.value }));
                setError(null);
              }}
              placeholder="Ex: Nome completo"
              autoFocus
              className={inputClass(theme)}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass(theme)}>Tipo do campo</label>
            <select
              value={draft.type}
              onChange={(e) => handleTypeChange(e.target.value as FieldType)}
              className={inputClass(theme)}
            >
              {FIELD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="field-placeholder" className={labelClass(theme)}>
              Placeholder (opcional)
            </label>
            <input
              id="field-placeholder"
              value={draft.placeholder ?? ""}
              onChange={(e) => {
                const value =
                  draft.type === "currency"
                    ? maskCurrencyInput(e.target.value)
                    : e.target.value;
                setDraft((prev) => ({ ...prev, placeholder: value }));
              }}
              inputMode={draft.type === "currency" ? "decimal" : undefined}
              placeholder={
                draft.type === "currency"
                  ? "R$ 0,00"
                  : "Texto de exemplo exibido no campo"
              }
              className={inputClass(theme)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="field-required"
              type="checkbox"
              checked={draft.required}
              onChange={(e) => setDraft((prev) => ({ ...prev, required: e.target.checked }))}
              className={checkboxClass()}
            />
            <label htmlFor="field-required" className={`cursor-pointer text-sm font-medium ${mutedTextClass(theme)}`}>
              Campo obrigatório
            </label>
          </div>

          {showOptions && (
            <OptionsEditor
              options={draft.options ?? []}
              onChange={(options) => setDraft((prev) => ({ ...prev, options }))}
            />
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div
          className={`flex justify-end gap-3 pt-6 border-t ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button type="button" onClick={() => onOpenChange(false)} className={secondaryButtonClass(theme)}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave} className={primaryButtonClass()}>
            {field ? "Salvar alterações" : "Adicionar campo"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
