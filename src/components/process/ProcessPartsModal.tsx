import { memo } from "react";
import { mascararCNPJ, formatCpf } from "@/app/utils/masks";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Users } from "lucide-react";
import { Company, ProcessPart, SpecialRule } from "@/app/interfaces/processes";

interface ProcessPartsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeParts: ProcessPart[];
  passiveParts: ProcessPart[];
  companies: Company[];
  onCompanyClick?: (company: Company) => void;
}

export const ProcessPartsModal = memo(function ProcessPartsModal({
  open,
  onOpenChange,
  activeParts,
  passiveParts,
  companies,
  onCompanyClick,
}: ProcessPartsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary dark:text-primary" />
            Partes e Empresas do Processo
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Polo Ativo */}
          {activeParts.length > 0 && (
            <div className="min-w-0">
              <h4 className="font-semibold text-sm mb-3 text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0"></span>
                Polo Ativo ({activeParts.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeParts.map((part) => (
                  <div
                    key={part.id}
                    className="bg-card dark:bg-card border border-border dark:border-border rounded-lg p-3 text-sm"
                  >
                    <Badge variant="outline" className="mb-2 text-xs">
                      {part.tipo}
                    </Badge>
                    <p className="font-medium text-foreground dark:text-card-foreground mb-1 break-words">
                      {part.nome}
                    </p>
                    {part.documento?.numero && (
                      <p className="text-muted-foreground dark:text-muted text-xs break-all">
                        {part.documento.tipo === "CPF"
                          ? `CPF: ${formatCpf(part.documento.numero)}`
                          : `${part.documento.tipo}: ${part.documento.numero}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Polo Passivo */}
          {passiveParts.length > 0 && (
            <div className="min-w-0">
              <h4 className="font-semibold text-sm mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full flex-shrink-0"></span>
                Polo Passivo ({passiveParts.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {passiveParts.map((part) => (
                  <div
                    key={part.id}
                    className="bg-card dark:bg-card border border-border dark:border-border rounded-lg p-3 text-sm"
                  >
                    <Badge variant="outline" className="mb-2 text-xs">
                      {part.tipo}
                    </Badge>
                    <p className="font-medium text-foreground dark:text-card-foreground mb-1 break-words">
                      {part.nome}
                    </p>
                    {part.documento?.numero && (
                      <p className="text-muted-foreground dark:text-muted text-xs break-all">
                        {part.documento.tipo === "CPF"
                          ? `CPF: ${formatCpf(part.documento.numero)}`
                          : `${part.documento.tipo}: ${part.documento.numero}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empresas */}
          {companies.length > 0 && (
            <div className="min-w-0">
              <h4 className="font-semibold text-sm mb-3 text-primary dark:text-primary flex items-center gap-2">
                <Building2 className="h-4 w-4 flex-shrink-0 text-primary dark:text-primary" />
                Empresas Envolvidas ({companies.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {companies.map((company) => (
                  <div
                    key={company._id}
                    onClick={() => {
                      onCompanyClick?.(company);
                      onOpenChange(false);
                    }}
                    className="bg-primary/10 dark:bg-primary-foreground/10 border border-primary dark:border-primary-foreground rounded-lg p-3 text-sm cursor-pointer hover:bg-primary/20 dark:hover:bg-primary-foreground/20 transition-colors"
                  >
                    <p className="font-medium text-foreground dark:text-card-foreground mb-1 break-words">
                      {company.name}
                    </p>
                    <p className="text-muted-foreground dark:text-muted mb-2 text-xs break-all">
                      CNPJ: {mascararCNPJ(company.cnpj)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.score !== undefined && (
                        <Badge
                          variant={
                            company.score >= 7 ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          Score: {company.score}
                        </Badge>
                      )}
                      {company.specialRule && (
                        <Badge
                          variant={
                            company.specialRule === SpecialRule.SOLVENT
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {company.specialRule === SpecialRule.SOLVENT
                            ? "Solvente"
                            : "Insolvente"}
                        </Badge>
                      )}
                      {!company.specialRule && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground dark:text-muted"
                        >
                          Solvência: N/D
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem quando não há partes */}
          {activeParts.length === 0 &&
            passiveParts.length === 0 &&
            companies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground dark:text-muted">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50 text-primary dark:text-primary" />
                <p>Nenhuma parte ou empresa encontrada para este processo.</p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
