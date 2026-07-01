import { generateParcelasSchedule } from "@/lib/carne";
import type { Tables, TablesInsert } from "@/types/database.types";
import type { ContratoFormValues } from "@/modules/contratos/schemas/contrato.schema";

function num(value: string): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

/** Converte os valores do formulário em uma linha de contrato (sem org_id). */
export function toContratoRow(
  values: ContratoFormValues,
): Omit<TablesInsert<"contratos">, "org_id"> {
  return {
    tipo: values.tipo,
    cliente_id: values.cliente_id,
    imovel_id: values.tipo === "imovel" ? values.imovel_id || null : null,
    veiculo_id: values.tipo === "veiculo" ? values.veiculo_id || null : null,
    numero: values.numero?.trim() || null,
    valor: num(values.valor),
    data_inicio: values.data_inicio,
    data_fim: values.data_fim,
    dia_vencimento: Number(values.dia_vencimento),
    qtd_parcelas: Number(values.qtd_parcelas),
    indice_reajuste: values.indice_reajuste,
    multa_percent: num(values.multa_percent),
    juros_mes_percent: num(values.juros_mes_percent),
    observacoes: values.observacoes?.trim() || null,
    status: values.status,
  };
}

/** Monta as linhas de parcelas do carnê para um contrato recém-criado. */
export function buildParcelasRows(
  contrato: Tables<"contratos">,
): TablesInsert<"parcelas">[] {
  const schedule = generateParcelasSchedule({
    valor: contrato.valor,
    qtdParcelas: contrato.qtd_parcelas,
    diaVencimento: contrato.dia_vencimento,
    dataInicio: contrato.data_inicio,
  });

  return schedule.map((p) => ({
    org_id: contrato.org_id,
    contrato_id: contrato.id,
    numero: p.numero,
    valor: p.valor,
    vencimento: p.vencimento,
    status: "pendente" as const,
  }));
}

/** Converte um contrato do banco nos valores do formulário (edição). */
export function toContratoFormValues(
  contrato: Tables<"contratos">,
): ContratoFormValues {
  return {
    tipo: contrato.tipo,
    cliente_id: contrato.cliente_id,
    imovel_id: contrato.imovel_id ?? "",
    veiculo_id: contrato.veiculo_id ?? "",
    numero: contrato.numero ?? "",
    valor: String(contrato.valor),
    data_inicio: contrato.data_inicio,
    data_fim: contrato.data_fim,
    dia_vencimento: String(contrato.dia_vencimento),
    qtd_parcelas: String(contrato.qtd_parcelas),
    indice_reajuste: contrato.indice_reajuste,
    multa_percent: String(contrato.multa_percent),
    juros_mes_percent: String(contrato.juros_mes_percent),
    observacoes: contrato.observacoes ?? "",
    status: contrato.status,
  };
}
