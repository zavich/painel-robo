export interface LawsuitParte {
  parteId: string | null;
  instanciaId: string | null;
  tipo: string | null;
  polo: string | null;
  nome: string | null;
  docTipo: string | null;
  docNumero: string | null;
  advogadoDe: string | null;
  principal: string | null;
}

export interface LawsuitMovimentacao {
  instanciaId: string | null;
  grau: string | null;
  movimentacaoId: string | null;
  data: string | null;
  conteudo: string | null;
  documentoId: string | null;
  texto: string | null;
  nomeDocumento: string | null;
}

export interface LawsuitInstancia {
  instanciaId: string | null;
  grau: string | null;
  classe: string | null;
  area: string | null;
  orgaoJulgador: string | null;
  dataDistribuicao: string | null;
  valorCausa: string | null;
  arquivado: string | null;
  dataArquivamento: string | null;
  assuntoPrincipal: string | null;
  assuntoPrincipalCodigo: string | null;
  assuntosJson: string | null;
  segredo: string | null;
  sistema: string | null;
  lastUpdateTime: string | null;
}

export interface Lawsuit {
  cnjNumber: string;
  statusColeta: string | null;
  motivoErro: string | null;
  enriquecidoEm: string | null;
  origem: string | null;
  numInstancias: string | null;
  trt: string | null;
  anoProcesso: string | null;
  partes: LawsuitParte[];
  movimentacoes: LawsuitMovimentacao[];
  instancias: LawsuitInstancia[];
}
