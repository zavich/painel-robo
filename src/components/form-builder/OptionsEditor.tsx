"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { iconButtonClass, inputClass, labelClass } from "@/components/form-builder/styles";

interface OptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const { theme } = useTheme();

  const handleAdd = () => {
    onChange([...options, ""]);
  };

  const handleEdit = (index: number, value: string) => {
    onChange(options.map((option, i) => (i === index ? value : option)));
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className={labelClass(theme)}>Opções</label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 animate-fade-in-up">
            <input
              value={option}
              onChange={(e) => handleEdit(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className={`${inputClass(theme)} !px-3 !py-2`}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className={`${iconButtonClass(theme, "destructive")} shrink-0`}
              title="Remover opção"
              aria-label={`Remover opção ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-sm font-medium transition-colors ${
          theme === "dark"
            ? "border-gray-600 text-gray-300 hover:bg-gray-700/50"
            : "border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Plus className="h-4 w-4" />
        Adicionar opção
      </button>
      {options.length === 0 && (
        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Adicione ao menos uma opção para este campo.
        </p>
      )}
    </div>
  );
}
