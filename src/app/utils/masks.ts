function mascararCNPJ(cnpj: string): string {
  if (!cnpj) {
    return "";
  }
  return cnpj
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}
function formatarTelefone(numero: string): string {
  const limpo = numero.replace(/\D/g, "");

  if (limpo.length <= 10) {
    // Fixo: (XX) XXXX-XXXX
    return limpo.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
  } else {
    // Celular: (XX) XXXXX-XXXX
    return limpo.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
  }
}

function formatarCEP(cep: string): string {
  return cep
    .replace(/\D/g, "") // Remove tudo que não é número
    .replace(/^(\d{5})(\d{0,3})/, "$1-$2") // Aplica a máscara
    .slice(0, 9); // Limita a 9 caracteres (incluindo o hífen)
}
function formatCpf(cpf: string): string {
  if (!cpf) {
    return "";
  }
  return cpf
    .replace(/\D/g, "")
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})\.(\d{3})(\d{1,2})$/, ".$1.$2-$3")
    .slice(0, 14);
}
function maskRG(value: string) {
  if (!value) {
    return "";
  }
  return value
    .replace(/\D/g, "") // Remove tudo que não for dígito
    .replace(/^(\d{2})(\d)/, "$1.$2") // Coloca o primeiro ponto
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") // Coloca o segundo ponto
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4") // Coloca o traço
    .slice(0, 12); // Limita ao tamanho máximo
}


function formatProcessNumber(value: string): string {
  // Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  return digits
    .replace(/^(.{7})(.{2})(.{4})(.{1})(.{2})(.{4}).*/, "$1-$2.$3.$4.$5.$6")
    .slice(0, 25);
}

export { mascararCNPJ, formatarTelefone, formatarCEP, formatCpf, maskRG, formatProcessNumber };
