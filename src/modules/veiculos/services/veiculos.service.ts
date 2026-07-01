import type { Tables, TablesInsert } from "@/types/database.types";
import type { VeiculoFormValues } from "@/modules/veiculos/schemas/veiculo.schema";

function text(value: string | undefined): string | null {
  if (value === undefined) return null;
  const t = value.trim();
  return t === "" ? null : t;
}

function money(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export function toVeiculoRow(
  values: VeiculoFormValues,
): Omit<TablesInsert<"veiculos">, "org_id"> {
  return {
    marca: values.marca.trim(),
    modelo: values.modelo.trim(),
    ano: values.ano && values.ano.trim() !== "" ? Number(values.ano) : null,
    placa: values.placa ? values.placa.trim().toUpperCase() || null : null,
    renavam: text(values.renavam),
    chassi: values.chassi ? values.chassi.trim().toUpperCase() || null : null,
    cor: text(values.cor),
    valor_aluguel: money(values.valor_aluguel),
    status: values.status,
    observacoes: text(values.observacoes),
  };
}

export function toVeiculoFormValues(
  veiculo: Tables<"veiculos">,
): VeiculoFormValues {
  return {
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano ? String(veiculo.ano) : "",
    placa: veiculo.placa ?? "",
    renavam: veiculo.renavam ?? "",
    chassi: veiculo.chassi ?? "",
    cor: veiculo.cor ?? "",
    valor_aluguel: veiculo.valor_aluguel ? String(veiculo.valor_aluguel) : "",
    status: veiculo.status,
    observacoes: veiculo.observacoes ?? "",
  };
}
