import { Lawsuit, LawsuitMovimentacao } from "@/app/interfaces/lawsuit";
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

  // Contador compartilhado entre todos os níveis (não só o array do topo) —
  // anexos ficam aninhados em listas separadas por movimentação pai, então
  // um índice reiniciado por lista colidiria entre anexos de pais diferentes
  // (ambos cairiam em -1 na primeira posição, quebrando key do React).
  let fallbackIndex = 0;

  function mapMovimentacao(mov: LawsuitMovimentacao): Movimentacoes {
    const movimentacaoId = Number(mov.movimentacaoId);
    fallbackIndex += 1;
    return {
      // Fallback pra 0 colidia entre todos os itens sem movimentacaoId
      // válido, quebrando key do React e a lógica de newMovementIds/seleção
      // — usa um id negativo estável, que nunca colide com um
      // movimentacaoId real (sempre positivo).
      id: Number.isFinite(movimentacaoId) && movimentacaoId !== 0
        ? movimentacaoId
        : -fallbackIndex,
      data: mov.data ?? "",
      conteudo: mov.conteudo ?? "",
      instancia: mov.grau ?? "",
      texto: mov.texto ?? undefined,
      documentoId: mov.documentoId ?? undefined,
      nomeDocumento: mov.nomeDocumento ?? undefined,
      anexos: mov.anexos?.length
        ? mov.anexos.map(mapMovimentacao)
        : undefined,
    };
  }

  return lawsuit.movimentacoes.map(mapMovimentacao);
}
