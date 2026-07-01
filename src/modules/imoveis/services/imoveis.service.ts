import { onlyDigits } from "@/lib/validators/documento";
import { maskCep } from "@/lib/masks";
import type { Tables, TablesInsert } from "@/types/database.types";
import type { ImovelFormValues } from "@/modules/imoveis/schemas/imovel.schema";

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

export function toImovelRow(
  values: ImovelFormValues,
): Omit<TablesInsert<"imoveis">, "org_id"> {
  return {
    codigo: values.codigo.trim(),
    tipo: values.tipo,
    status: values.status,
    cep: values.cep ? onlyDigits(values.cep) || null : null,
    logradouro: text(values.logradouro),
    numero: text(values.numero),
    complemento: text(values.complemento),
    bairro: text(values.bairro),
    cidade: text(values.cidade),
    estado: text(values.estado),
    valor_aluguel: money(values.valor_aluguel),
    valor_condominio: money(values.valor_condominio),
    valor_iptu: money(values.valor_iptu),
    descricao: text(values.descricao),
    observacoes: text(values.observacoes),
  };
}

export function toImovelFormValues(
  imovel: Tables<"imoveis">,
): ImovelFormValues {
  const num = (n: number): string => (n ? String(n) : "");
  return {
    codigo: imovel.codigo,
    tipo: imovel.tipo,
    status: imovel.status,
    cep: imovel.cep ? maskCep(imovel.cep) : "",
    logradouro: imovel.logradouro ?? "",
    numero: imovel.numero ?? "",
    complemento: imovel.complemento ?? "",
    bairro: imovel.bairro ?? "",
    cidade: imovel.cidade ?? "",
    estado: imovel.estado ?? "",
    valor_aluguel: num(imovel.valor_aluguel),
    valor_condominio: num(imovel.valor_condominio),
    valor_iptu: num(imovel.valor_iptu),
    descricao: imovel.descricao ?? "",
    observacoes: imovel.observacoes ?? "",
  };
}
