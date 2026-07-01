import { onlyDigits } from "@/lib/validators/documento";
import { maskCep, maskCpfCnpj, maskPhone } from "@/lib/masks";
import type { Tables, TablesInsert } from "@/types/database.types";
import type { ClienteFormValues } from "@/modules/clientes/schemas/cliente.schema";

/** Normaliza um texto opcional: `undefined`/vazio → null; senão trim. */
function text(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Normaliza dígitos opcionais (documento, telefone, CEP). */
function digits(value: string | undefined): string | null {
  if (value === undefined) return null;
  const d = onlyDigits(value);
  return d === "" ? null : d;
}

/**
 * Converte os valores validados do formulário em uma linha para o banco.
 * Aplica as regras de armazenamento: documentos/telefones/CEP só com dígitos.
 * `org_id` é preenchido na action (a partir do contexto autenticado).
 */
export function toClienteRow(
  values: ClienteFormValues,
): Omit<TablesInsert<"clientes">, "org_id"> {
  return {
    tipo: values.tipo,
    nome: values.nome.trim(),
    documento: digits(values.documento),
    rg: text(values.rg),
    data_nascimento: text(values.data_nascimento),
    telefone: digits(values.telefone),
    whatsapp: digits(values.whatsapp),
    email: text(values.email),
    cep: digits(values.cep),
    logradouro: text(values.logradouro),
    numero: text(values.numero),
    complemento: text(values.complemento),
    bairro: text(values.bairro),
    cidade: text(values.cidade),
    estado: text(values.estado),
    observacoes: text(values.observacoes),
    status: values.status,
  };
}

/** Converte uma linha do banco nos valores do formulário (edição). */
export function toClienteFormValues(
  cliente: Tables<"clientes">,
): ClienteFormValues {
  return {
    tipo: cliente.tipo,
    nome: cliente.nome,
    documento: cliente.documento ? maskCpfCnpj(cliente.documento) : "",
    rg: cliente.rg ?? "",
    data_nascimento: cliente.data_nascimento ?? "",
    telefone: cliente.telefone ? maskPhone(cliente.telefone) : "",
    whatsapp: cliente.whatsapp ? maskPhone(cliente.whatsapp) : "",
    email: cliente.email ?? "",
    cep: cliente.cep ? maskCep(cliente.cep) : "",
    logradouro: cliente.logradouro ?? "",
    numero: cliente.numero ?? "",
    complemento: cliente.complemento ?? "",
    bairro: cliente.bairro ?? "",
    cidade: cliente.cidade ?? "",
    estado: cliente.estado ?? "",
    observacoes: cliente.observacoes ?? "",
    status: cliente.status,
  };
}
