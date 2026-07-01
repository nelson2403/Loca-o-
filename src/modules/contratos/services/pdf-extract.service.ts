import "server-only";

/**
 * Extração heurística de dados de um contrato a partir do texto de um PDF.
 * É best-effort: retorna o que conseguir identificar. A tela de conferência
 * permite corrigir/completar manualmente.
 */

export interface ContratoExtraido {
  nome?: string;
  documento?: string;
  valor?: string;
  data_inicio?: string; // yyyy-MM-dd
  data_fim?: string; // yyyy-MM-dd
  dia_vencimento?: string;
  qtd_parcelas?: string;
  cep?: string;
  endereco?: string;
}

function toIsoDate(br: string): string | undefined {
  const m = br.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function parseContratoText(text: string): ContratoExtraido {
  const out: ContratoExtraido = {};
  const flat = text.replace(/\s+/g, " ");

  // Documento (CPF/CNPJ)
  const doc =
    flat.match(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/) ??
    flat.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/);
  if (doc) out.documento = doc[0];

  // Nome (após rótulos comuns)
  const nome = flat.match(
    /(?:locat[áa]rio|contratante|nome)[:\s]+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'\s]{4,60})/i,
  );
  if (nome) out.nome = nome[1].trim().replace(/\s+(cpf|rg|portador).*$/i, "");

  // Valor (R$)
  const valor = flat.match(/R\$\s*([\d.]+,\d{2})/);
  if (valor) {
    out.valor = valor[1].replace(/\./g, "").replace(",", ".");
  }

  // Datas (primeiras duas ocorrências → início/fim)
  const datas = flat.match(/\d{2}\/\d{2}\/\d{4}/g);
  if (datas && datas.length >= 1) out.data_inicio = toIsoDate(datas[0]);
  if (datas && datas.length >= 2) out.data_fim = toIsoDate(datas[1]);

  // Dia de vencimento
  const venc = flat.match(/vencimento[^\d]{0,20}(\d{1,2})/i);
  if (venc) out.dia_vencimento = venc[1];

  // Quantidade de parcelas
  const parc = flat.match(/(\d{1,3})\s*(?:parcelas|meses|vezes)/i);
  if (parc) out.qtd_parcelas = parc[1];

  // CEP
  const cep = flat.match(/\b\d{5}-?\d{3}\b/);
  if (cep) out.cep = cep[0];

  // Endereço (após "endereço" / "situado")
  const end = flat.match(
    /(?:endere[çc]o|situad[oa]\s+(?:na|no|à|a))[:\s]+([^,;]{6,80})/i,
  );
  if (end) out.endereco = end[1].trim();

  return out;
}
