"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CalcNoteValues = {
  ownerType?: string;
  margemPercentual?: string;
  valorComMargem?: string;
  valorPosFgts?: string;
  valorPosHonorarios?: string;
  desagio50?: string;
  desagio30?: string;
};

interface CalcNoteModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialValues?: Partial<CalcNoteValues>;
  onSubmit?: (noteMarkdown: string, values: CalcNoteValues) => void;
  titleSuffix?: string; // e.g., nome do documento
  dealId?: number; // para envio direto ao pipedrive
}

function toCurrency(value?: string) {
  if (!value) return "";
  // Keep as provided; assume already formatted like R$ 0,00
  return value;
}

export function buildCalcNoteMarkdown(values: CalcNoteValues, titleSuffix?: string) {
  const header = `Notas – Planilha de Cálculos${titleSuffix ? ` (${titleSuffix})` : ""}`;
  return [
    header,
    "",
    `Tipo do Proprietário: ${values.ownerType || "-"}`,
    `Margem Percentual: ${values.margemPercentual || "-"}`,
    `Valor com Margem: ${toCurrency(values.valorComMargem) || "-"}`,
    `Valor Pós FGTS: ${toCurrency(values.valorPosFgts) || "-"}`,
    `Valor Pós Honorários: ${toCurrency(values.valorPosHonorarios) || "-"}`,
    `Deságio 50: ${toCurrency(values.desagio50) || "-"}`,
    `Deságio 30: ${toCurrency(values.desagio30) || "-"}`,
    "",
  ].join("\n");
}

export default function CalcNoteModal({ open, onOpenChange, initialValues, onSubmit, titleSuffix }: CalcNoteModalProps) {
  const [form, setForm] = useState<CalcNoteValues>({
    ownerType: initialValues?.ownerType || "",
    margemPercentual: initialValues?.margemPercentual || "",
    valorComMargem: initialValues?.valorComMargem || "",
    valorPosFgts: initialValues?.valorPosFgts || "",
    valorPosHonorarios: initialValues?.valorPosHonorarios || "",
    desagio50: initialValues?.desagio50 || "",
    desagio30: initialValues?.desagio30 || "",
  });

  // Keep form in sync when initialValues change
  const memoInitial = useMemo(() => initialValues, [initialValues]);
  useMemo(() => {
    setForm({
      ownerType: memoInitial?.ownerType || "",
      margemPercentual: memoInitial?.margemPercentual || "",
      valorComMargem: memoInitial?.valorComMargem || "",
      valorPosFgts: memoInitial?.valorPosFgts || "",
      valorPosHonorarios: memoInitial?.valorPosHonorarios || "",
      desagio50: memoInitial?.desagio50 || "",
      desagio30: memoInitial?.desagio30 || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoInitial]);

  const notePreview = useMemo(() => buildCalcNoteMarkdown(form, titleSuffix), [form, titleSuffix]);

  function handleSubmit() {
    onSubmit?.(notePreview, form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar notas ao Pipedrive</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Tipo do Proprietário</Label>
              <Input value={form.ownerType} onChange={(e) => setForm({ ...form, ownerType: e.target.value })} />
            </div>
            <div>
              <Label>Margem Percentual</Label>
              <Input value={form.margemPercentual} onChange={(e) => setForm({ ...form, margemPercentual: e.target.value })} />
            </div>
            <div>
              <Label>Valor com Margem</Label>
              <Input value={form.valorComMargem} onChange={(e) => setForm({ ...form, valorComMargem: e.target.value })} />
            </div>
            <div>
              <Label>Valor Pós FGTS</Label>
              <Input value={form.valorPosFgts} onChange={(e) => setForm({ ...form, valorPosFgts: e.target.value })} />
            </div>
            <div>
              <Label>Valor Pós Honorários</Label>
              <Input value={form.valorPosHonorarios} onChange={(e) => setForm({ ...form, valorPosHonorarios: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Deságio 50</Label>
                <Input value={form.desagio50} onChange={(e) => setForm({ ...form, desagio50: e.target.value })} />
              </div>
              <div>
                <Label>Deságio 30</Label>
                <Input value={form.desagio30} onChange={(e) => setForm({ ...form, desagio30: e.target.value })} />
              </div>
            </div>
          </div>
          <div>
            <Label>Pré-visualização da nota</Label>
            <div className="mt-2 p-3 border rounded bg-muted/40 text-sm whitespace-pre-wrap max-h-72 overflow-auto">
              {notePreview}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard?.writeText(notePreview).catch(() => {});
            }}
          >Copiar nota</Button>
          <Button variant="default" onClick={handleSubmit}>Enviar ao Pipedrive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


