"use client";

import { useProcessAutoRefresh } from "@/app/hooks/useProcessAutoRefresh";
import { getClaimant, getDefendant } from "@/app/utils/processPartsUtils";
import { formatDate } from "@/app/utils/processUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  TextWrappingType,
  VerticalPositionRelativeFrom,
} from "docx";
import { FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
type FormType = {
  number: string;
  cumSent: string;
  claimant: string;
  defendant: string;
  phase: string;
  court: string;
  location: string;
  distributionDate: string;
  summary: string;
  appeal: string;
  riskAnalysis: string;
  compliance: string;
  totalCreditLift: string;
  observation: string;
  guaranteedJurisdiction: string;
  chanceOfReversal: string;
  substitutionByAuthor: string;
  subsidiaryLiabilityPeriod: string;
  feeAgreements: string;
};
type FormKey = keyof FormType;
export default function AnalysisPage() {
  const params = useParams();
  const id = params?.number as string;

  const { process, isLoading } = useProcessAutoRefresh({
    processId: id,
    enabled: false,
    intervalMs: 10000,
  });
  const [form, setForm] = useState<FormType>({
    number: "",
    cumSent: "",
    claimant: "",
    defendant: "",
    phase: "",
    court: "",
    location: "",
    distributionDate: "",
    summary: "",
    appeal: "",
    riskAnalysis: "",
    compliance: "",
    totalCreditLift: "",
    observation: "",
    guaranteedJurisdiction: "",
    chanceOfReversal: "",
    substitutionByAuthor: "",
    subsidiaryLiabilityPeriod: "",
    feeAgreements: "",
  });
  useEffect(() => {
    if (process) {
      setForm({
        ...form,
        number: process.number,
        cumSent: process.processExecution?.number || "",
        claimant: getClaimant(process.processParts || [])?.nome || "",
        defendant: getDefendant(process.processParts || [])?.nome || "",
        court: "TRT",
        distributionDate:
          formatDate(process?.instanciasAutos?.[0]?.data_distribuicao) || "",
      });
    }
  }, [process]);

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const fields: [FormKey, string][] = [
    ["number", "RT nº"],
    ["cumSent", "CumSent."],
    ["claimant", "Reclamante"],
    ["defendant", "Reclamada"],
    ["phase", "Momento processual"],
    ["court", "Vara de origem"],
    ["location", "Localização dos autos"],
    ["distributionDate", "Data distribuição"],
  ];
  const longFields: [FormKey, string][] = [
    ["summary", "Resumo do Caso"],
    ["appeal", "Recurso de Revista"],
    ["riskAnalysis", "Análise de Risco"],
    ["compliance", "Cumprimento de Sentença"],
    ["totalCreditLift", "Levantamento do crédito total"],
    ["observation", "Observação"],
    ["guaranteedJurisdiction", "Juízo garantido?"],
    ["chanceOfReversal", "Chance de reversão?"],
    ["substitutionByAuthor", "Há substabelecimento pelo autor"],
    [
      "subsidiaryLiabilityPeriod",
      "Há responsabilidade subsidiária, se sim, qual período?",
    ],
    ["feeAgreements", "Há contratos de honorários"],
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Carregando...
        </div>
      </div>
    );
  }
  const disable = [
    "distributionDate",
    "number",
    "claimant",
    "defendant",
    "cumSent",
    "court",
  ];

  const downloadDocx = async () => {
    const response = await fetch("/logo-juri-capital.png");
    const logoBlob = await response.blob();
    const logo = await logoBlob.arrayBuffer();

    // helpers FORA do children
    const labelRow = (label: string, value?: string) =>
      new Paragraph({
        spacing: { after: 90 },
        children: [
          new TextRun({
            text: label,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: value || "",
            size: 22,
          }),
        ],
      });

    const title = (text: string) =>
      new Paragraph({
        spacing: { before: 260, after: 140 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 24,
            underline: {},
          }),
        ],
      });

    const textBlock = (value?: string) =>
      new Paragraph({
        spacing: { after: 140 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: value || "",
            size: 22,
          }),
        ],
      });

    const doc = new Document({
      creator: "Juri Capital",
      title: "Análise Jurídica",

      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1200,
                right: 1000,
                bottom: 1200,
                left: 1000,
              },
            },
          },

          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: {
                    before: 0,
                    after: 120,
                    line: 240,
                  },
                  children: [
                    new ImageRun({
                      type: "png", // obrigatório para PNG
                      data: logo,
                      transformation: {
                        width: 140,
                        height: 42,
                      },
                      floating: {
                        horizontalPosition: {
                          relative: HorizontalPositionRelativeFrom.PAGE,
                          offset: 900,
                        },
                        verticalPosition: {
                          relative: VerticalPositionRelativeFrom.PAGE,
                          offset: 250,
                        },
                        wrap: {
                          type: TextWrappingType.NONE,
                        },
                      },
                    }),
                  ],
                }),

                new Paragraph({
                  border: {
                    bottom: {
                      color: "D9D9D9",
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 4,
                    },
                  },
                }),
              ],
            }),
          },

          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: "Site: Juri.capital | contato@juri.capital | Rua Groenlândia, 66 – Jardim América, São Paulo, SP",
                      size: 18,
                    }),
                  ],
                }),
              ],
            }),
          },

          children: [
            // CABEÇALHO DADOS
            labelRow("RT nº.: ", form.number),
            labelRow("CumSent.: ", form.cumSent),
            labelRow("Reclamante: ", form.claimant),
            labelRow("Reclamada: ", form.defendant),
            labelRow("Momento processual: ", form.phase),
            labelRow("Vara de origem: ", form.court),
            labelRow("Localização dos autos: ", form.location),
            labelRow("Data de distribuição no TST: ", form.distributionDate),

            // RESUMO
            title("RESUMO DO CASO"),
            textBlock(form.summary),

            // STATUS
            title("STATUS DOS PEDIDOS"),
            labelRow(
              "• Pedidos deferidos e que possuem coisa julgada formal: ",
              "",
            ),
            labelRow(
              "• Pedidos deferidos, mas que são objeto de recurso pela reclamada: ",
              "",
            ),
            labelRow("• Pedidos que são objetos do contrato de cessão: ", ""),

            // REVISTA
            title("RECURSO DE REVISTA"),
            textBlock(form.appeal),

            // RISCO
            title("ANÁLISE DE RISCO"),
            textBlock(form.riskAnalysis),

            // CUMPRIMENTO
            title("CUMPRIMENTO DE SENTENÇA"),
            textBlock(form.compliance),
            labelRow("Levantamento do crédito total: ", form.totalCreditLift),

            // OBS
            title("OBSERVAÇÃO"),
            labelRow("Juízo garantido? ", form.guaranteedJurisdiction),
            labelRow("Chance de reversão? ", form.chanceOfReversal),
            labelRow(
              "Há substabelecimento pelo autor: ",
              form.substitutionByAuthor,
            ),
            labelRow(
              "Há responsabilidade subsidiária, se sim, qual período? ",
              form.subsidiaryLiabilityPeriod,
            ),
            labelRow("Há contratos de honorários: ", form.feeAgreements),

            // CONCLUSÃO
            title("CONCLUSÃO"),
            textBlock(
              "Pelo exposto, opino pela antecipação total/parcial dos créditos decorrentes da presente ação.",
            ),

            // TROQUE SOMENTE O BLOCO FINAL PELO ABAIXO

            new Paragraph({
              spacing: { before: 260, after: 80 },
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "NOME",
                  bold: true,
                  size: 22,
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 80 },
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "OAB/SP",
                  size: 22,
                }),
              ],
            }),

            new Paragraph({
              spacing: { before: 120 },
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "São Paulo, 16 de março de 2026.",
                  size: 22,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analise-juri-capital.docx";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3 max-h-[95vh] overflow-auto">
          <h1 className="text-xl font-bold">Editor Juri Capital</h1>
          {fields.map(([k, l]) => (
            <div key={k}>
              <label className="text-sm">{l}</label>
              <Input
                disabled={disable.includes(k)}
                value={form[k]}
                onChange={(e) => update(k, e.target.value)}
              />
            </div>
          ))}
          {longFields.map(([k, l]) => (
            <div key={k}>
              <label className="text-sm capitalize">{l}</label>
              <Textarea
                rows={4}
                value={form[k]}
                onChange={(e) => update(k, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={downloadDocx} className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Baixar DOCX
          </Button>
        </CardContent>
      </Card>
      <div className="bg-neutral-200 p-3 h-screen overflow-hidden">
        <div className="h-full overflow-auto flex justify-center">
          <div
            className="
        bg-white shadow rounded
        w-[620px]
        min-h-[875px]
        px-[42px]
        pt-[42px]
        pb-[52px]
        text-[9px]
        leading-[1.28]
        relative
        font-serif
        text-black
        origin-top
      "
          >
            {/* HEADER */}
            <div className="mb-4">
              <img
                src="/logo-juri-capital.png"
                alt="Juri Capital"
                className="h-[38px] object-contain"
              />
            </div>

            {/* CAMPOS */}
            <div className="space-y-[2px]">
              <p>
                <strong>RT nº.:</strong> {form.number}
              </p>
              <p>
                <strong>CumSent.:</strong> {form.cumSent}
              </p>
              <p>
                <strong>Reclamante:</strong> {form.claimant}
              </p>
              <p>
                <strong>Reclamada:</strong> {form.defendant}
              </p>
              <p>
                <strong>Momento processual:</strong> {form.phase}
              </p>
              <p>
                <strong>Vara de origem:</strong> {form.court}
              </p>
              <p>
                <strong>Localização dos autos:</strong> {form.location}
              </p>
              <p>
                <strong>Data de distribuição no TST:</strong>{" "}
                {form.distributionDate}
              </p>
            </div>

            {/* RESUMO */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Resumo do Caso
            </h2>
            <p className="text-justify whitespace-pre-line line-clamp-5">
              {form.summary}
            </p>

            {/* STATUS */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Status dos Pedidos
            </h2>

            <div className="space-y-[1px] pl-3">
              <p>• Pedidos deferidos e que possuem coisa julgada formal</p>
              <p>• Pedidos deferidos com recurso pela reclamada</p>
              <p>• Pedidos objetos do contrato de cessão</p>
            </div>

            {/* REVISTA */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Recurso de Revista
            </h2>
            <p className="text-justify whitespace-pre-line line-clamp-4">
              {form.appeal}
            </p>

            {/* RISCO */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Análise de Risco
            </h2>
            <p className="text-justify whitespace-pre-line line-clamp-4">
              {form.riskAnalysis}
            </p>

            {/* CUMPRIMENTO */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Cumprimento de Sentença
            </h2>

            <p className="text-justify whitespace-pre-line line-clamp-4">
              {form.compliance}
            </p>

            <p className="mt-1">
              <strong>Levantamento do crédito total:</strong>{" "}
              {form.totalCreditLift}
            </p>

            {/* OBS */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Observação
            </h2>

            <div className="space-y-[1px]">
              <p>
                <strong>Juízo garantido?</strong> {form.guaranteedJurisdiction}
              </p>
              <p>
                <strong>Chance de reversão?</strong> {form.chanceOfReversal}
              </p>
              <p>
                <strong>Substabelecimento:</strong> {form.substitutionByAuthor}
              </p>
              <p>
                <strong>Resp. subsidiária:</strong>{" "}
                {form.subsidiaryLiabilityPeriod}
              </p>
              <p>
                <strong>Honorários:</strong> {form.feeAgreements}
              </p>
            </div>

            {/* CONCLUSÃO */}
            <h2 className="mt-4 mb-1 font-bold underline uppercase text-[10px]">
              Conclusão
            </h2>

            <p className="text-justify line-clamp-3">
              Pelo exposto, opino pela antecipação total/parcial dos créditos
              decorrentes da presente ação.
            </p>

            {/* ASSINATURA */}
            <div className="mt-6 text-center">
              <p className="font-bold">NOME</p>
              <p>OAB/SP</p>
            </div>

            <div className="mt-3 text-right">
              São Paulo, 16 de março de 2026.
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-3 left-[42px] right-[42px] text-center text-[8px]">
              Site: Juri.capital | contato@juri.capital | Rua Groenlândia, 66 –
              Jardim América, São Paulo, SP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
