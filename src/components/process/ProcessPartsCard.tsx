import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Building2, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { formatCpf, mascararCNPJ } from "@/app/utils/masks";
import { Company, ProcessPart } from "@/app/interfaces/processes";
import { Badge } from "../ui/badge";
import { capitalizeWords } from "@/app/utils/format";

interface ProcessPartsCardProps {
  processParts: ProcessPart[];
  onCompanyClick: (company: any) => void;
  companies: Company[];
  isLoading?: boolean;
}

export function ProcessPartsCard({
  processParts,
  onCompanyClick,
  companies,
  isLoading = false,
}: ProcessPartsCardProps) {
  const [showParts, setShowParts] = useState(true);

  const hasAtivo = processParts?.some((part) => part.polo === "ATIVO");
  const hasPassivo = processParts?.some((part) => part.polo === "PASSIVO");
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <CardTitle className="text-gray-900 dark:text-gray-100">Todas as Partes do Processo</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowParts((v) => !v)}
          aria-label={showParts ? "Recolher" : "Expandir"}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {showParts ? <ChevronUp className="text-gray-600 dark:text-gray-400" /> : <ChevronDown className="text-gray-600 dark:text-gray-400" />}
        </Button>
      </CardHeader>
      {showParts && (
        <CardContent>
          {!hasAtivo && !hasPassivo ? (
            <div className="text-center text-muted-foreground dark:text-gray-400 py-8">
              Não há partes para exibir neste processo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Polo Ativo */}
              {hasAtivo && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-green-600 dark:text-green-400">
                    Polo Ativo
                  </h4>
                  <div className="space-y-3">
                    {processParts
                      ?.filter(
                        (part: { polo: string }) => part.polo === "ATIVO"
                      )
                      .map((part, index) => (
                        <div
                          key={index}
                          className="border border-border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
                        >
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                              {part.tipo}
                            </span>
                            {part.principal && (
                              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">
                            {part.nome}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {part.documento?.tipo}:{" "}
                            {part.documento?.tipo === "CPF"
                              ? formatCpf(part.documento?.numero ?? "")
                              : part.documento?.tipo === "CNPJ"
                              ? mascararCNPJ(part.documento?.numero ?? "")
                              : part.documento?.numero}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Polo Passivo */}
              {hasPassivo && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-red-600 dark:text-red-400">
                    Polo Passivo
                  </h4>
                  <div className="space-y-3">
                    {processParts
                      ?.filter((part) => part.polo === "PASSIVO")
                      .map((part, index) => (
                        <div
                          key={index}
                          className="border border-border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
                        >
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
                              {part.tipo}
                            </span>
                            {part.principal && (
                              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">
                            {part.nome}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {part.documento?.tipo}:{" "}
                            {part.documento?.tipo === "CPF"
                              ? formatCpf(part.documento?.numero ?? "")
                              : part.documento?.tipo === "CNPJ"
                              ? mascararCNPJ(part.documento?.numero ?? "")
                              : part.documento?.numero}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Empresas (Reclamadas) */}
          {companies && companies?.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-semibold text-sm mb-4 text-blue-600 dark:text-blue-400">
                Empresas (Reclamadas)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <div
                    key={company._id}
                    className="border border-border dark:border-gray-600 rounded-lg p-3 hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group bg-white dark:bg-gray-700"
                    onClick={() => onCompanyClick(company)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                            Reclamada
                          </span>
                          {company.specialRule && (
                            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                              {company.specialRule}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompanyClick(company);
                          }}
                        >
                          <Eye className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium text-sm leading-tight text-gray-900 dark:text-gray-100">
                          {capitalizeWords(company.name)}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          CNPJ: {mascararCNPJ(company.cnpj)}
                        </p>
                        {(typeof company.score === 'number' || company.porte || company.registrationStatus) && (
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {typeof company.score === 'number' ? `Score: ${company.score}` : ''}
                            {typeof company.score === 'number' && (company.porte || company.registrationStatus) ? ' · ' : ''}
                            {company.porte ? `Porte: ${company.porte}` : ''}
                            {company.porte && company.registrationStatus ? ' · ' : ''}
                            {company.registrationStatus ? `Registro: ${company.registrationStatus}` : ''}
                          </p>
                        )}
                        {company.email && (
                          <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                            {company.email}
                          </p>
                        )}
                        {company.legalNature && (
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {company.legalNature}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
