"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ListPlus, Plus, Save, Eraser, Type } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";
import { FieldCard } from "@/components/form-builder/FieldCard";
import { FieldEditor } from "@/components/form-builder/FieldEditor";
import { FormPreview } from "@/components/form-builder/FormPreview";
import { useForms } from "@/app/hooks/forms/useForms";
import { FormDefinition, FormField } from "@/app/interfaces/forms";
import {
  inputClass,
  labelClass,
  mutedTextClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionCardClass,
  sectionIconClass,
  sectionTitleClass,
} from "@/components/form-builder/styles";

interface FormBuilderProps {
  initialForm?: FormDefinition;
}

export function FormBuilder({ initialForm }: FormBuilderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { createForm, updateForm } = useForms();
  const isEditing = Boolean(initialForm);

  const [formName, setFormName] = useState(initialForm?.name ?? "");
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields ?? []);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const openAddField = () => {
    setEditingField(null);
    setEditorOpen(true);
  };

  const openEditField = (field: FormField) => {
    setEditingField(field);
    setEditorOpen(true);
  };

  const handleSaveField = (field: FormField) => {
    setFields((prev) => {
      const exists = prev.some((item) => item.id === field.id);
      if (exists) {
        return prev.map((item) => (item.id === field.id ? field : item));
      }
      return [...prev, field];
    });
    setEditorOpen(false);
  };

  const handleDeleteField = (id: string) => {
    setFields((prev) => prev.filter((item) => item.id !== id));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    setFields((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const resetForm = () => {
    setFormName("");
    setFields([]);
  };

  const handleClear = () => {
    resetForm();
    toast.info("Formulário limpo.");
  };

  const handleCancel = () => {
    router.push("/dashboard/forms");
  };

  const handleSubmit = async () => {
    const name = formName.trim();

    if (!name) {
      toast.error("Informe o nome do formulário.");
      return;
    }

    if (fields.length === 0) {
      toast.error("Adicione ao menos um campo ao formulário.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && initialForm) {
        await updateForm(initialForm.id, { name, fields });
        toast.success("Formulário atualizado com sucesso");
      } else {
        await createForm({ name, fields });
        toast.success("Formulário criado com sucesso");
      }

      router.push("/dashboard/forms");
    } catch {
      toast.error("Não foi possível salvar o formulário. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <div className={sectionCardClass(theme)}>
            <div className="flex items-center gap-3 mb-4">
              <div className={sectionIconClass()}>
                <Type className="h-4 w-4 text-white" />
              </div>
              <h3 className={sectionTitleClass(theme)}>Dados do formulário</h3>
            </div>
            <div className="space-y-2">
              <label htmlFor="form-name" className={labelClass(theme)}>
                Nome do formulário
              </label>
              <input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Cadastro de Cliente"
                className={inputClass(theme)}
              />
            </div>
          </div>

          <div className={sectionCardClass(theme)}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={sectionIconClass()}>
                  <ListPlus className="h-4 w-4 text-white" />
                </div>
                <h3 className={sectionTitleClass(theme)}>
                  Campos do formulário
                </h3>
              </div>
              <button
                type="button"
                onClick={openAddField}
                className={`${primaryButtonClass()} !px-4 !py-2 text-sm`}
              >
                <Plus className="h-4 w-4" />
                Adicionar campo
              </button>
            </div>

            {fields.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <ListPlus
                  className={`h-8 w-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                />
                <p className={`text-sm ${mutedTextClass(theme)}`}>
                  Nenhum campo adicionado ainda.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        isFirst={index === 0}
                        isLast={index === fields.length - 1}
                        onEdit={() => openEditField(field)}
                        onDelete={() => handleDeleteField(field.id)}
                        onMoveUp={() => moveField(index, -1)}
                        onMoveDown={() => moveField(index, 1)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <FormPreview name={formName} fields={fields} />
      </div>

      <div
        className={`flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <button
          type="button"
          onClick={handleCancel}
          className={secondaryButtonClass(theme)}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleClear}
          className={secondaryButtonClass(theme)}
        >
          <Eraser className="h-4 w-4" />
          Limpar formulário
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className={`${primaryButtonClass()} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <FieldEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        field={editingField}
        onSave={handleSaveField}
      />
    </div>
  );
}
