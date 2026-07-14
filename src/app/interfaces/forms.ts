export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormDefinition {
  id: string;
  name: string;
  fields: FormField[];
}

export interface FieldTypeOption {
  value: FieldType;
  label: string;
}

export const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "currency", label: "Valor" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "date", label: "Data" },
  { value: "time", label: "Hora" },
  { value: "textarea", label: "Área de texto" },
  { value: "select", label: "Seleção (Select)" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "Upload de arquivo" },
];

export const FIELD_TYPES_WITH_OPTIONS: FieldType[] = ["select", "radio"];

export function getFieldTypeLabel(type: FieldType): string {
  return FIELD_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function fieldTypeHasOptions(type: FieldType): boolean {
  return FIELD_TYPES_WITH_OPTIONS.includes(type);
}

export function createEmptyFormDefinition(): Omit<FormDefinition, "id"> {
  return { name: "", fields: [] };
}
