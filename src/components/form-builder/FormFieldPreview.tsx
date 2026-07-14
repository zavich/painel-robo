"use client";

import { FormField } from "@/app/interfaces/forms";
import { checkboxClass, inputClass, mutedTextClass } from "@/components/form-builder/styles";

interface FormFieldPreviewProps {
  field: FormField;
  theme: string;
  compact?: boolean;
}

export function FormFieldPreview({ field, theme, compact = false }: FormFieldPreviewProps) {
  const labelClassName = compact
    ? `block text-xs font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`
    : `block text-sm font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`;

  const label = (
    <label className={labelClassName}>
      {field.label || "Campo sem nome"}
      {field.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  const controlClass = compact
    ? `${inputClass(theme)} !py-1.5 !px-2.5 !text-xs !rounded-lg pointer-events-none`
    : inputClass(theme);

  const wrapperSpacing = compact ? "space-y-1" : "space-y-1.5";
  const radioOptions = compact ? (field.options ?? []).slice(0, 2) : field.options ?? [];
  const remainingRadioOptions = compact ? (field.options?.length ?? 0) - radioOptions.length : 0;

  switch (field.type) {
    case "textarea":
      return (
        <div className={wrapperSpacing}>
          {label}
          <textarea
            placeholder={field.placeholder}
            disabled
            rows={compact ? 1 : 3}
            className={`${controlClass} resize-none`}
          />
        </div>
      );
    case "select":
      return (
        <div className={wrapperSpacing}>
          {label}
          <select disabled className={controlClass}>
            <option>{field.placeholder || "Selecione..."}</option>
            {(field.options ?? []).map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        </div>
      );
    case "radio":
      return (
        <div className={wrapperSpacing}>
          {label}
          <div className={compact ? "space-y-1" : "space-y-2"}>
            {radioOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  disabled
                  name={field.id}
                  className={compact ? "h-3 w-3 accent-secondary" : "h-4 w-4 accent-secondary"}
                />
                <span className={`${compact ? "text-xs" : "text-sm"} ${mutedTextClass(theme)}`}>
                  {option}
                </span>
              </div>
            ))}
            {remainingRadioOptions > 0 && (
              <p className={`text-xs ${mutedTextClass(theme)}`}>
                +{remainingRadioOptions} opções
              </p>
            )}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <input type="checkbox" disabled className={checkboxClass()} />
          {label}
        </div>
      );
    case "file":
      return (
        <div className={wrapperSpacing}>
          {label}
          <input type="file" disabled className={controlClass} />
        </div>
      );
    case "currency":
      return (
        <div className={wrapperSpacing}>
          {label}
          <input
            type="text"
            inputMode="decimal"
            placeholder={field.placeholder || "R$ 0,00"}
            disabled
            className={controlClass}
          />
        </div>
      );
    default:
      return (
        <div className={wrapperSpacing}>
          {label}
          <input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className={controlClass}
          />
        </div>
      );
  }
}
