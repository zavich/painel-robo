import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
// Espaço reservado no topo para o número da página ("Fls.: N") e, futuramente,
// o brasão da República — ainda não temos o arquivo de imagem pra embutir.
const TOP_MARGIN = 90;
const BODY_FONT_SIZE = 10;
const HEADER_FONT_SIZE = 11;
const FOOTER_FONT_SIZE = 8;
const PARAGRAPH_INDENT = 28;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = BODY_FONT_SIZE * 1.4;
const HEADER_LINE_HEIGHT = HEADER_FONT_SIZE * 1.4;
const FOOTER_LINE_HEIGHT = FOOTER_FONT_SIZE * 1.4;
const FOOTER_COLOR = rgb(0.4, 0.4, 0.4);
const TEXT_COLOR = rgb(0, 0, 0);

interface ClassifiedLines {
  header: string[];
  body: string[];
}

// Linhas como "RECLAMANTE: FULANO" ou "ATOrd 0000092-16.2026.5.06.0182" têm
// letras minúsculas (RECLAMANTE tem "a" maiúsculo mas "ATOrd" mistura caixa),
// mas ainda fazem parte do cabeçalho — por isso a checagem de "só maiúsculas"
// sozinha não basta.
const HEADER_PREFIX_PATTERN =
  /^(RECLAMANTE|RECLAMADO|AUTOR|R[ÉE]U|REQUERENTE|REQUERIDO|EXEQUENTE|EXECUTADO|AGRAVANTE|AGRAVADO|EMBARGANTE|EMBARGADO|APELANTE|APELADO|RECORRENTE|RECORRIDO)\s*:/i;
const CASE_CODE_PATTERN = /^[A-Za-zÀ-ÿ]{2,15}\s+\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;
// Usado tanto pra decidir se um trecho antes de um rodapé removido termina
// uma frase (então a quebra de página vira quebra de parágrafo) quanto pra
// juntar parágrafos fragmentados pelo extrator de PDF do PJe.
const SENTENCE_END_PATTERN = /[.!?:;][”"')\]]?$/;
// Documentos com várias páginas no PJe repetem o cabeçalho apenas na
// primeira; um documento inteiro em CAIXA ALTA (raro, mas existe) não pode
// virar cabeçalho gigante — por segurança, limitamos quantas linhas seguidas
// entram no cabeçalho.
const MAX_HEADER_LINES = 15;

function looksLikeHeaderLine(line: string): boolean {
  if (HEADER_PREFIX_PATTERN.test(line) || CASE_CODE_PATTERN.test(line)) {
    return true;
  }
  return !/[a-záàâãéèêíïóôõöúçñ]/.test(line);
}

// O texto extraído de movimentações mais longas (sentenças/acórdãos) vem da
// concatenação de todas as páginas do PDF original do PJe — e cada página
// repete o rodapé de assinatura ("Documento assinado eletronicamente por...")
// no meio do texto, seguido de um caractere de quebra de página ("\f").
// Sem remover isso, a primeira ocorrência travava o "modo rodapé" e o resto
// do documento inteiro virava fonte pequena cinza. Aqui removemos todas as
// ocorrências do corpo e guardamos a última pra usar como rodapé do nosso
// PDF (mesmo texto de assinatura, mostrado uma única vez, no final).
const PAGE_FOOTER_BLOCK_PATTERN =
  /\s*Documento assinado eletronicamente por[^\n]*(?:\n+\s*https?:\/\/\S+)?(?:\n+\s*N[uú]mero do processo:[^\n]*)?(?:\n+\s*N[uú]mero do documento:[^\n]*)?\s*\f?/gi;

function extractFooterAndCleanText(text: string): {
  cleanedText: string;
  footer: string[];
} {
  const matches = Array.from(text.matchAll(PAGE_FOOTER_BLOCK_PATTERN));
  const lastMatch = matches[matches.length - 1];
  const footer = lastMatch
    ? lastMatch[0]
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  // Se o texto antes do rodapé já termina uma frase, a quebra de página cai
  // numa fronteira natural de parágrafo — vira "\n\n". Caso contrário, o
  // rodapé interrompeu uma frase no meio (comum: metade da frase termina
  // numa página, a outra metade começa na próxima) — vira um espaço, pra
  // reconectar as duas partes em vez de criar um parágrafo falso no meio da
  // frase.
  const cleanedText = text
    .replace(PAGE_FOOTER_BLOCK_PATTERN, (match, offset: number) => {
      const before = text.slice(0, offset).trimEnd();
      return SENTENCE_END_PATTERN.test(before) ? "\n\n" : " ";
    })
    // "\f" isolado (quebra de página sem rodapé de assinatura junto) vira
    // separador de parágrafo, não deve grudar palavras de páginas diferentes.
    .replace(/\f/g, "\n\n");

  return { cleanedText, footer };
}

// Cabeçalho = linhas iniciais que "parecem" cabeçalho (ver looksLikeHeaderLine).
function classifyLines(text: string): ClassifiedLines {
  const rawLines = text.split("\n");
  const header: string[] = [];
  const body: string[] = [];
  let mode: "header" | "body" = "header";

  for (const raw of rawLines) {
    const line = raw.trim();

    if (mode === "header") {
      if (line === "") continue;
      if (looksLikeHeaderLine(line) && header.length < MAX_HEADER_LINES) {
        header.push(line);
        continue;
      } else {
        mode = "body";
      }
    }

    body.push(raw);
  }

  return { header, body };
}

// Extração de PDF costuma inserir uma linha em branco a cada quebra visual,
// mesmo no meio de uma frase contínua (texto justificado). Só tratamos como
// parágrafo novo quando o trecho anterior realmente termina em pontuação de
// fechamento de frase — senão, o próximo trecho é uma continuação e não deve
// ganhar recuo/indentação própria.
//
// Sentenças/acórdãos usam títulos de seção em CAIXA ALTA no meio do corpo
// (ex: "MÉRITO", "PRELIMINARMENTE", "DA APLICABILIDADE DA LEI N. 13.467/2017")
// — sem pontuação final, então a regra de continuação acima os grudaria no
// parágrafo seguinte. Tratamos como título isolado (negrito, sem recuo).
// Exige tamanho mínimo e ao menos uma letra maiúscula de verdade, senão
// trechos como "636.157,98." (só números) ou "É" (uma letra isolada) também
// seriam classificados como título.
const SECTION_HEADING_MAX_LENGTH = 100;
const SECTION_HEADING_MIN_LENGTH = 3;

function isSectionHeading(chunk: string): boolean {
  if (
    chunk.length < SECTION_HEADING_MIN_LENGTH ||
    chunk.length > SECTION_HEADING_MAX_LENGTH
  ) {
    return false;
  }
  if (/[a-záàâãéèêíïóôõöúçñ]/.test(chunk)) {
    return false;
  }
  return /[A-ZÀ-Ý]/.test(chunk);
}

interface BodyParagraph {
  text: string;
  heading: boolean;
}

function bodyToParagraphs(bodyLines: string[]): BodyParagraph[] {
  const chunks = bodyLines
    .join("\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const paragraphs: BodyParagraph[] = [];
  for (const chunk of chunks) {
    if (isSectionHeading(chunk)) {
      paragraphs.push({ text: chunk, heading: true });
      continue;
    }

    const previous = paragraphs[paragraphs.length - 1];
    const canMergeIntoPrevious =
      previous && !previous.heading && !SENTENCE_END_PATTERN.test(previous.text);

    if (canMergeIntoPrevious) {
      previous.text = `${previous.text} ${chunk}`;
    } else {
      paragraphs.push({ text: chunk, heading: false });
    }
  }

  return paragraphs;
}

// "IGARASSU/PE, 18 de junho de 2026." — local e data de fechamento, que no
// documento original abre o bloco de assinatura (nome do(a) magistrado(a) e
// cargo, centralizados, um por linha) em vez de continuar como parágrafo.
const CLOSING_DATE_PATTERN =
  /^[^,/]+\/[A-Z]{2},\s*\d{1,2}\s+de\s+\p{L}+\s+de\s+\d{4}\.?$/u;

function splitClosingBlock(bodyLines: string[]): {
  main: string[];
  closing: string[];
} {
  const splitIndex = bodyLines.findIndex((line) =>
    CLOSING_DATE_PATTERN.test(line.trim()),
  );

  if (splitIndex === -1) {
    return { main: bodyLines, closing: [] };
  }

  return {
    main: bodyLines.slice(0, splitIndex),
    closing: bodyLines
      .slice(splitIndex)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

// As fontes padrão do pdf-lib (Helvetica) usam a codificação WinAnsi
// (cp1252), que não cobre ligaduras tipográficas ("ﬁ", "ﬂ", ...) — comuns em
// texto extraído de PDF — e travava a geração inteira do documento. Expande
// as ligaduras conhecidas pro equivalente em ASCII antes de qualquer medição
// ou desenho de texto.
const LIGATURE_REPLACEMENTS: Record<string, string> = {
  "ﬀ": "ff",
  "ﬁ": "fi",
  "ﬂ": "fl",
  "ﬃ": "ffi",
  "ﬄ": "ffl",
  "ﬅ": "st",
  "ﬆ": "st",
};

// Além de todo o intervalo Latin-1 (0x00–0xFF, cobre acentuação do
// português), o WinAnsi também suporta esse conjunto de pontuação
// "tipográfica" fora desse intervalo (aspas curvas, travessões, reticências
// etc.) — comum em texto de PDF. Qualquer outro caractere é tratado como
// potencialmente não suportado.
const WINANSI_EXTRA_CODEPOINTS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

function isLikelyWinAnsiEncodable(codePoint: number): boolean {
  return codePoint <= 0xff || WINANSI_EXTRA_CODEPOINTS.has(codePoint);
}

// Rede de segurança pra qualquer outro caractere fora do WinAnsi (emojis,
// símbolos raros, outras ligaduras não mapeadas): tenta decompor e remover
// acentos combinantes; se mesmo assim não couber, descarta o caractere em
// vez de derrubar a geração inteira do PDF por causa de um glifo isolado.
const LIGATURE_RANGE_PATTERN = /[ﬀ-ﬆ]/g;
const COMBINING_MARKS_PATTERN = /[̀-ͯ]/g;

function sanitizeForPdf(text: string): string {
  const withLigaturesExpanded = text.replace(
    LIGATURE_RANGE_PATTERN,
    (char) => LIGATURE_REPLACEMENTS[char] ?? char,
  );

  return Array.from(withLigaturesExpanded)
    .map((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      if (isLikelyWinAnsiEncodable(codePoint)) return char;

      // Remove acentos combinantes que a decomposição NFKD deixar pra trás
      // (ex.: um caractere acentuado exótico vira letra base + acento).
      const decomposed = char.normalize("NFKD").replace(COMBINING_MARKS_PATTERN, "");
      return Array.from(decomposed).every((c) =>
        isLikelyWinAnsiEncodable(c.codePointAt(0) ?? 0),
      )
        ? decomposed
        : "";
    })
    .join("");
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  if (text === "") return [""];

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push(current);

  return lines;
}

class PdfWriter {
  private page: PDFPage;
  private y = 0;
  private pageNumber = 0;

  private constructor(
    private readonly doc: PDFDocument,
    private readonly regularFont: PDFFont,
    private readonly boldFont: PDFFont,
  ) {
    this.page = this.addPage();
  }

  static async create(): Promise<PdfWriter> {
    const doc = await PDFDocument.create();
    const regularFont = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    return new PdfWriter(doc, regularFont, boldFont);
  }

  private addPage(): PDFPage {
    this.pageNumber += 1;
    const page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const label = `Fls.: ${this.pageNumber}`;
    page.drawText(label, {
      x: PAGE_WIDTH - MARGIN - this.regularFont.widthOfTextAtSize(label, 9),
      y: PAGE_HEIGHT - 35,
      size: 9,
      font: this.regularFont,
      color: TEXT_COLOR,
    });
    this.y = PAGE_HEIGHT - TOP_MARGIN;
    return page;
  }

  private ensureSpace() {
    if (this.y < MARGIN) {
      this.page = this.addPage();
    }
  }

  private drawCentered(text: string, font: PDFFont, size: number) {
    this.ensureSpace();
    const width = font.widthOfTextAtSize(text, size);
    this.page.drawText(text, {
      x: (PAGE_WIDTH - width) / 2,
      y: this.y,
      size,
      font,
      color: TEXT_COLOR,
    });
  }

  private drawLeft(text: string, x: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>) {
    this.ensureSpace();
    if (text) {
      this.page.drawText(text, { x, y: this.y, size, font, color });
    }
  }

  drawHeaderLine(text: string) {
    for (const line of wrapText(text, this.boldFont, HEADER_FONT_SIZE, MAX_WIDTH)) {
      this.drawCentered(line, this.boldFont, HEADER_FONT_SIZE);
      this.y -= HEADER_LINE_HEIGHT;
    }
  }

  drawBodyParagraph(text: string) {
    const lines = wrapText(text, this.regularFont, BODY_FONT_SIZE, MAX_WIDTH);
    lines.forEach((line, idx) => {
      const x = idx === 0 ? MARGIN + PARAGRAPH_INDENT : MARGIN;
      this.drawLeft(line, x, this.regularFont, BODY_FONT_SIZE, TEXT_COLOR);
      this.y -= LINE_HEIGHT;
    });
    this.y -= LINE_HEIGHT * 0.4;
  }

  drawSectionHeading(text: string) {
    this.y -= LINE_HEIGHT * 0.3;
    for (const line of wrapText(text, this.boldFont, BODY_FONT_SIZE, MAX_WIDTH)) {
      this.drawLeft(line, MARGIN, this.boldFont, BODY_FONT_SIZE, TEXT_COLOR);
      this.y -= LINE_HEIGHT;
    }
    this.y -= LINE_HEIGHT * 0.3;
  }

  drawClosingLine(text: string, bold: boolean) {
    const font = bold ? this.boldFont : this.regularFont;
    for (const line of wrapText(text, font, BODY_FONT_SIZE, MAX_WIDTH)) {
      this.drawCentered(line, font, BODY_FONT_SIZE);
      this.y -= LINE_HEIGHT;
    }
  }

  drawFooterLine(text: string) {
    for (const line of wrapText(text, this.regularFont, FOOTER_FONT_SIZE, MAX_WIDTH)) {
      this.drawLeft(line, MARGIN, this.regularFont, FOOTER_FONT_SIZE, FOOTER_COLOR);
      this.y -= FOOTER_LINE_HEIGHT;
    }
  }

  addGap(amount: number) {
    this.y -= amount;
  }

  async finish(): Promise<Blob> {
    const pdfBytes = await this.doc.save();
    // Copia pra um Uint8Array com ArrayBuffer próprio — usar `.buffer` direto
    // ignora byteOffset/byteLength e pode incluir bytes fora do slice real,
    // gerando um PDF corrompido ou maior que o necessário; o tipo de
    // `pdfBytes.buffer` (ArrayBufferLike) também não bate com BlobPart.
    return new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
  }
}

/**
 * Gera um PDF a partir do texto extraído de uma movimentação do PJe,
 * aproximando o layout do documento oficial: cabeçalho centralizado em
 * negrito, corpo com recuo de parágrafo, rodapé de assinatura menor e
 * numeração de página ("Fls.: N"). Não inclui o brasão da República —
 * ainda não temos a imagem pra embutir no PDF.
 */
export async function generateTextPdf(text: string): Promise<Blob> {
  const { cleanedText, footer } = extractFooterAndCleanText(sanitizeForPdf(text));
  const { header, body } = classifyLines(cleanedText);
  const { main, closing } = splitClosingBlock(body);
  const paragraphs = bodyToParagraphs(main);

  const writer = await PdfWriter.create();

  header.forEach((line) => writer.drawHeaderLine(line));
  writer.addGap(HEADER_LINE_HEIGHT * 0.5);

  paragraphs.forEach((paragraph) =>
    paragraph.heading
      ? writer.drawSectionHeading(paragraph.text)
      : writer.drawBodyParagraph(paragraph.text),
  );

  // Bloco de fechamento: local/data (regular), depois nome do(a)
  // magistrado(a) em negrito e o cargo abaixo, todos centralizados — como no
  // documento original, em vez de virar um parágrafo corrido.
  if (closing.length > 0) {
    writer.addGap(LINE_HEIGHT * 0.6);
    const [dateLine, ...signatureLines] = closing;
    writer.drawClosingLine(dateLine, false);
    if (signatureLines.length > 0) {
      writer.addGap(LINE_HEIGHT * 1.2);
      signatureLines.forEach((line, idx) =>
        writer.drawClosingLine(line, idx === 0),
      );
    }
  }

  if (footer.length > 0) {
    writer.addGap(FOOTER_LINE_HEIGHT);
    footer.forEach((line) => writer.drawFooterLine(line));
  }

  return writer.finish();
}
