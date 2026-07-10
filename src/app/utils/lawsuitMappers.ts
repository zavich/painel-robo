import { Lawsuit } from "@/app/interfaces/lawsuit";
import { Movimentacoes, ProcessPart } from "@/app/interfaces/processes";

export function mapLawsuitPartes(
  lawsuit?: Lawsuit | null,
): ProcessPart[] {
  if (!lawsuit?.partes) {
    return [];
  }

  return lawsuit.partes.map((parte) => ({
    id: parte.parteId ?? "",
    tipo: parte.tipo ?? "",
    nome: parte.nome ?? "",
    documento: {
      tipo: parte.docTipo ?? undefined,
      numero: parte.docNumero ?? undefined,
    },
    oabs: [],
    polo: parte.polo ?? "",
    principal: parte.principal === "true",
    advogado_de: parte.advogadoDe ?? "",
  }));
}

export function mapLawsuitMoviments(
  lawsuit?: Lawsuit | null,
): Movimentacoes[] {
  if (!lawsuit?.movimentacoes) {
    return [];
  }

  return lawsuit.movimentacoes.map((mov, index) => {
    const movimentacaoId = Number(mov.movimentacaoId);
    return {
      // Fallback pra 0 colidia entre todos os itens sem movimentacaoId
      // válido, quebrando key do React e a lógica de newMovementIds/seleção
      // — usa um id negativo estável por posição, que nunca colide com um
      // movimentacaoId real (sempre positivo).
      id: Number.isFinite(movimentacaoId) && movimentacaoId !== 0
        ? movimentacaoId
        : -(index + 1),
      data: mov.data ?? "",
      conteudo: mov.conteudo ?? "",
      instancia: mov.grau ?? "",
      texto: mov.texto ?? undefined,
    };
  });
}
