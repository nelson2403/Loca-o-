/**
 * Geração da agenda de parcelas (carnê) a partir das condições do contrato.
 *
 * Regra: a parcela 1 vence no mês da data de início; as seguintes a cada mês,
 * sempre no `diaVencimento` (ajustado para o último dia quando o mês é mais
 * curto — ex.: dia 31 em fevereiro vira 28/29).
 */

export interface ParcelaSchedule {
  numero: number;
  valor: number;
  vencimento: string; // yyyy-MM-dd
}

interface GenerateInput {
  valor: number;
  qtdParcelas: number;
  diaVencimento: number;
  dataInicio: string; // yyyy-MM-dd
}

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function generateParcelasSchedule({
  valor,
  qtdParcelas,
  diaVencimento,
  dataInicio,
}: GenerateInput): ParcelaSchedule[] {
  const [year, month] = dataInicio.split("-").map(Number); // month = 1..12
  const baseMonthIndex = (month ?? 1) - 1; // 0..11

  const parcelas: ParcelaSchedule[] = [];
  for (let k = 0; k < qtdParcelas; k++) {
    const total = baseMonthIndex + k;
    const y = (year ?? new Date().getFullYear()) + Math.floor(total / 12);
    const m = total % 12; // 0..11
    const day = Math.min(diaVencimento, daysInMonth(y, m));
    parcelas.push({
      numero: k + 1,
      valor,
      vencimento: `${y}-${pad(m + 1)}-${pad(day)}`,
    });
  }
  return parcelas;
}
