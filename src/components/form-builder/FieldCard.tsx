"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { FormField, getFieldTypeLabel } from "@/app/interfaces/forms";
import { cardItemClass, iconButtonClass, pillClass } from "@/components/form-builder/styles";

interface FieldCardProps {
  field: FormField;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function FieldCard({
  field,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: FieldCardProps) {
  const { theme } = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`animate-fade-in-up flex items-center gap-3 ${cardItemClass(theme)} ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`cursor-grab touch-none active:cursor-grabbing ${
          theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
        }`}
        title="Arrastar para reordenar"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={pillClass(theme)}>{getFieldTypeLabel(field.type)}</span>
          {field.options && field.options.length > 0 && (
            <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {field.options.length} opções
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className={iconButtonClass(theme)}
          title="Mover para cima"
          aria-label="Mover para cima"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className={iconButtonClass(theme)}
          title="Mover para baixo"
          aria-label="Mover para baixo"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className={iconButtonClass(theme, "accent")}
          title="Editar campo"
          aria-label="Editar campo"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={iconButtonClass(theme, "destructive")}
          title="Excluir campo"
          aria-label="Excluir campo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
