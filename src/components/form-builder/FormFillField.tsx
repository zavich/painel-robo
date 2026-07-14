"use client";

import { ChangeEvent } from "react";
import { FormField } from "@/app/interfaces/forms";
import { maskCurrencyInput } from "@/app/utils/masks";
import {
  checkboxClass,
  inputClass,
  labelClass,
  mutedTextClass,
} from "@/components/form-builder/styles";

export type FormFillValue = string | boolean;

interface FormFillFieldProps {
  field: FormField;
  theme: string;
  value: FormFillValue;
  onChange: (value: FormFillValue) => void;
}

export function FormFillField({ field, theme, value, onChange }: FormFillFieldProps) {
  const stringValue = typeof value === "string" ? value : "";

  const label = (
    <label className={labelClass(theme)}>
      {field.label}
      {field.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );

  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-1.5">
          {label}
          <textarea
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${inputClass(theme)} resize-none`}
          />
        </div>
      );
    case "select":
      return (
        <div className="space-y-1.5">
          {label}
          <select
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass(theme)}
          >
            <option value="">{field.placeholder || "Selecione..."}</option>
            {(field.options ?? []).map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    case "radio":
      return (
        <div className="space-y-1.5">
          {label}
          <div className="space-y-2">
            {(field.options ?? []).map((option, index) => (
              <label key={index} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  checked={stringValue === option}
                  onChange={() => onChange(option)}
                  className="h-4 w-4 accent-secondary cursor-pointer"
                />
                <span className={`text-sm ${mutedTextClass(theme)}`}>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <label className={`flex cursor-pointer items-center gap-2 ${labelClass(theme)}`}>
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className={checkboxClass()}
          />
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      );
    case "file":
      return (
        <div className="space-y-1.5">
          {label}
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
            className={inputClass(theme)}
          />
        </div>
      );
    case "currency":
      return (
        <div className="space-y-1.5">
          {label}
          <input
            type="text"
            inputMode="decimal"
            value={stringValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(maskCurrencyInput(e.target.value))
            }
            placeholder={field.placeholder || "R$ 0,00"}
            className={inputClass(theme)}
          />
        </div>
      );
    default: {
      const inputType = field.type === "phone" ? "tel" : field.type;
      return (
        <div className="space-y-1.5">
          {label}
          <input
            type={inputType}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={inputClass(theme)}
          />
        </div>
      );
    }
  }
}
