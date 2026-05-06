"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Edit,
  Save,
  X,
  User,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Key,
  RefreshCw,
} from "lucide-react";
import { mascararCNPJ } from "@/app/utils/masks";
import { capitalizeWords } from "@/app/utils/format";
import { Company, SpecialRule } from "@/app/interfaces/processes";
import { formatarParaReal } from "@/app/utils/formatar-dinheiro";
import { useCompanyByCnpj } from "@/app/api/hooks/company/useCompanyByCnpj";
import { useEditCompany } from "@/app/api/hooks/company/useEditCompany";
import { useRequestCompanyDocument } from "@/app/api/hooks/company/useRequestCompanyDocument";
import dynamic from "next/dynamic";
import PDFViewerHeader from "../shared/PdfViewerHeader";

const PDFViewer = dynamic(() => import("@/components/shared/PDFViewer"), {
  ssr: false,
});

interface CompanyModalDialogProps {
  cnpj: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyModalDialog({
  cnpj,
  isOpen,
  onClose,
}: CompanyModalDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const { data: companyData, refetch: refetchCompany } = useCompanyByCnpj(cnpj);
  const { mutate: editCompany } = useEditCompany();
  const { mutate: requestCompanyDocument, isPending } =
    useRequestCompanyDocument();
  const [isPollingCertificate, setIsPollingCertificate] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [showCertificate, setShowCertificate] = useState(true);
  const [showPartners, setShowPartners] = useState(true);
  const [pdfRetryKey, setPdfRetryKey] = useState(0);
  const [partnersToShow, setPartnersToShow] = useState(3);
  const totalPartners = company?.partners.length || 0;
  const hasMorePartners = partnersToShow < totalPartners;

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  // Opções de porte da empresa baseadas na imagem fornecida
  const porteOptions = [
    { value: "0", label: "Não informado" },
    { value: "1", label: "Microempresa" },
    { value: "3", label: "Empresa de pequeno porte" },
    { value: "5", label: "Demais" },
  ];

  const registrationStatusOptions = [
    { value: "1", label: "Nula" },
    { value: "2", label: "Ativa" },
    { value: "3", label: "Suspensa" },
    { value: "4", label: "Inapta" },
    { value: "8", label: "Baixada" },
  ];

  const startPollingCertificate = useCallback(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(() => {
      refetchCompany();
    }, 3000);
  }, [refetchCompany]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setPdfRetryKey((key) => key + 1);
      }, 200);

      // Verifica se já está processando quando o modal abre (PENDING ou PROCESSING)
      if (
        (companyData?.cndt?.status === "PROCESSING" ||
          companyData?.cndt?.status === "PENDING") &&
        !isPollingCertificate
      ) {
        setIsPollingCertificate(true);
        startPollingCertificate();
      }
    } else {
      // Limpa o polling quando o modal fecha
      setIsPollingCertificate(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [
    isOpen,
    companyData?.cndt?.status,
    isPollingCertificate,
    startPollingCertificate,
  ]);

  useEffect(() => {
    if (
      companyData?.cndt?.status === "CONCLUDED" ||
      companyData?.cndt?.status === "ERROR"
    ) {
      setIsPollingCertificate(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } else if (
      (companyData?.cndt?.status === "PROCESSING" ||
        companyData?.cndt?.status === "PENDING") &&
      !isPollingCertificate
    ) {
      // Se já está processando ao carregar (PENDING ou PROCESSING), inicia o polling automaticamente
      setIsPollingCertificate(true);
      startPollingCertificate();
    }
  }, [
    companyData?.cndt?.status,
    isPollingCertificate,
    startPollingCertificate,
  ]);

  // Start certificate emission and polling
  const handleEmitCertificate = () => {
    requestCompanyDocument(
      { cnpj: company?.cnpj || "", type: "cndt" },
      {
        onSuccess: () => {
          setIsPollingCertificate(true);
          startPollingCertificate();
        },
      },
    );
  };

  useEffect(() => {
    if (companyData) {
      setCompany({ ...companyData });
    }
  }, [companyData]);

  if (!companyData || !company) return null;

  const handleSave = () => {
    if (!company || !companyData) return;
    editCompany(
      {
        id: company._id,
        payload: {
          registrationStatus: company.registrationStatus,
          specialRule: company.specialRule || "",
          reason: companyData.reason || "", // Mantém o valor original, não editável
          score: company.score ?? 0,
          porte: company.porte || "",
        },
      },
      {
        onSuccess: (data) => {
          setIsEditing(false);
          setCompany({ ...data });
        },
      },
    );
  };

  const handleCancel = () => {
    setCompany({ ...companyData });
    setIsEditing(false);
  };

  const updateField = (field: keyof Company, value: string) => {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.length !== 8) return dateString;
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const getAgeRangeLabel = (range: string) => {
    const ranges: Record<string, string> = {
      "1": "0-12 anos",
      "2": "13-20 anos",
      "3": "21-30 anos",
      "4": "31-40 anos",
      "5": "41-50 anos",
      "6": "51-60 anos",
      "7": "61-70 anos",
      "8": "71-80 anos",
      "9": "Acima de 80 anos",
    };
    return ranges[range] || `Faixa ${range}`;
  };

  function extractNumbers(text: string) {
    return (text.match(/(\d+),\d+/g) || []).map((value) =>
      Number(value.split(",")[0]),
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-light dark:from-secondary dark:to-secondary-light rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-secondary dark:text-secondary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Informações da Empresa
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Visualize e edite os dados da empresa
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-xl border-border dark:border-border hover:bg-primary/10 dark:hover:bg-primary-foreground/10 hover:border-primary dark:hover:border-primary-foreground"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-xl border-border dark:border-border hover:bg-card/10 dark:hover:bg-card-foreground/10"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light dark:from-primary dark:to-primary-light hover:from-primary hover:to-primary-light rounded-xl"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/10 dark:bg-secondary-foreground/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-secondary dark:text-secondary-foreground" />
                </div>
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Razão Social
                </Label>
                <p className="font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {capitalizeWords(company.name)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  CNPJ
                </Label>
                <p className="font-semibold font-mono text-gray-900 dark:text-gray-100 mt-1">
                  {mascararCNPJ(company.cnpj)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  E-mail
                </Label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {company.email || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Natureza Jurídica
                </Label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {company.legalNature || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Faturamento
                </Label>
                <p className="font-bold text-green-600 dark:text-green-400 mt-1">
                  {company.invoicing ? (
                    <>
                      R${" "}
                      {formatarParaReal(extractNumbers(company.invoicing)[0])} a
                      R${" "}
                      {formatarParaReal(extractNumbers(company.invoicing)[1])}
                    </>
                  ) : (
                    "-"
                  )}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Última Atualização
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(company.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Porte da Empresa
                </Label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {porteOptions.find((opt) => opt.value === company.porte)
                    ?.label || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Situação
                </Label>
                {isEditing ? (
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={company.registrationStatus || ""}
                    onChange={(e) =>
                      updateField("registrationStatus", e.target.value)
                    }
                  >
                    <option value="">Selecione...</option>
                    {registrationStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {registrationStatusOptions.find(
                      (opt) => opt.value === company.registrationStatus,
                    )?.label || "-"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Status
                </Label>
                {isEditing ? (
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={company.specialRule || ""}
                    onChange={(e) =>
                      updateField("specialRule", e.target.value as SpecialRule)
                    }
                  >
                    <option value="">Selecione...</option>
                    <option value={SpecialRule.SOLVENT}>Solvente</option>
                    <option value={SpecialRule.INSOLVENT}>Insolvente</option>
                  </select>
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {company.specialRule === SpecialRule.SOLVENT && "Solvente"}
                    {company.specialRule === SpecialRule.INSOLVENT &&
                      "Insolvente"}
                    {!company.specialRule && "-"}
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Motivo
                </Label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {company.reason || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Score
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={company.score ?? ""}
                    onChange={(e) => updateField("score", e.target.value)}
                    placeholder="Score da empresa"
                    min={0}
                    max={100}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {company.score ?? "-"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Card with collapse/expand */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div
                className="flex items-center justify-between w-full cursor-pointer select-none"
                onClick={() => {
                  setShowCertificate((prev) => !prev);
                  setTimeout(() => {
                    setPdfRetryKey((key) => key + 1);
                  }, 100);
                }}
              >
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  Certidão Negativa de Débitos Trabalhistas (CNDT)
                  {showCertificate ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </CardTitle>
                {companyData.cndt?.status === "CONCLUDED" &&
                  companyData.cndt?.temp_link && (
                    <Button
                      variant="success"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        window.open(companyData.cndt.temp_link, "_blank")
                      }
                    >
                      Baixar Certidão
                    </Button>
                  )}
              </div>
            </CardHeader>
            {showCertificate && (
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  {/* Loading state - mostra quando está processando */}
                  {(isPending ||
                    isPollingCertificate ||
                    companyData.cndt?.status === "PROCESSING" ||
                    companyData.cndt?.status === "PENDING") &&
                    companyData.cndt?.status !== "CONCLUDED" &&
                    companyData.cndt?.status !== "ERROR" && (
                      <div className="w-full flex flex-col items-center gap-3 py-4">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 text-yellow-500 dark:text-yellow-400 animate-spin" />
                          {isPending
                            ? "Iniciando emissão..."
                            : "Processando certidão..."}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-gray-400 text-center max-w-md">
                          {isPending
                            ? "Aguarde enquanto a requisição é enviada..."
                            : "Aguarde enquanto a certidão está sendo emitida. Isso pode levar alguns minutos."}
                        </p>
                        {!isPending && (
                          <div className="w-full max-w-md bg-yellow-100 dark:bg-yellow-900/30 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-full animate-pulse"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}

                  {companyData.cndt?.status === "ERROR" && (
                    <div className="w-full flex flex-col items-center gap-2">
                      <Badge variant="destructive">
                        Erro ao emitir certidão
                      </Badge>
                      <p className="text-xs text-destructive dark:text-red-400">
                        Ocorreu um erro ao emitir a certidão. Tente novamente.
                      </p>
                    </div>
                  )}
                  {(!companyData.cndt?.status ||
                    companyData.cndt?.status === "ERROR") &&
                    !isPollingCertificate &&
                    !isPending &&
                    companyData.cndt?.status !== "PROCESSING" &&
                    companyData.cndt?.status !== "PENDING" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleEmitCertificate}
                        className="mb-2"
                      >
                        Emitir Certidão
                      </Button>
                    )}

                  {/* PDF preview and download button */}
                  {companyData.cndt?.status === "CONCLUDED" &&
                    companyData.cndt?.temp_link && (
                      <div className="w-full flex flex-col items-center gap-2">
                        <div className="w-full border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow bg-muted/40 dark:bg-gray-700/40">
                          <PDFViewerHeader
                            pageNumber={pageNumber}
                            numPages={numPages}
                            scale={scale}
                            onPrev={goToPrevPage}
                            onNext={goToNextPage}
                            onZoomIn={zoomIn}
                            onZoomOut={zoomOut}
                          />
                          <PDFViewer
                            pdfUrl={companyData.cndt.temp_link}
                            pageNumber={pageNumber}
                            scale={scale}
                            numPages={numPages}
                            setNumPages={setNumPages}
                            retryKey={pdfRetryKey}
                          />
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Partners/Representatives Card with collapse/expand */}
          {company.partners && company.partners.length > 0 && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div
                  className="flex items-center justify-between w-full cursor-pointer select-none"
                  onClick={() => setShowPartners((prev) => !prev)}
                >
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    Sócios e Representantes ({company.partners.length})
                    {showPartners ? (
                      <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              {showPartners && (
                <CardContent>
                  <div className="space-y-4">
                    {company.partners
                      .slice(0, partnersToShow)
                      .map((partner, index) => (
                        <div
                          key={index}
                          className="border border-border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground dark:text-gray-400">
                                Nome
                              </Label>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {capitalizeWords(partner.socios_nome)}
                              </p>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                CPF
                              </Label>
                              <p className="font-medium font-mono text-gray-900 dark:text-gray-100">
                                {partner.socios_cpf_cnpj}
                              </p>
                            </div>

                            <div className="flex flex-col">
                              <Label className="text-xs text-muted-foreground dark:text-gray-400">
                                Qualificação
                              </Label>
                              <Badge
                                variant="secondary"
                                className="mt-1 max-w-[220px] truncate overflow-hidden whitespace-nowrap cursor-help bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                                title={partner.socios_qualificacao}
                              >
                                {partner.socios_qualificacao}
                              </Badge>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Data de Entrada
                              </Label>
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {formatDate(partner.socios_entrada)}
                              </p>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground dark:text-gray-400">
                                Faixa Etária
                              </Label>
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {getAgeRangeLabel(partner.socios_faixa_etaria)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {hasMorePartners && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setPartnersToShow(totalPartners)}
                      >
                        Ver mais ({totalPartners - partnersToShow} restantes)
                      </Button>
                    )}
                    {partnersToShow === totalPartners && totalPartners > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => setPartnersToShow(3)}
                      >
                        Ver menos
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
