import { z } from "zod";

import { isValidCpfCnpj } from "@/lib/validators/documento";

/**
 * Schema do formulário de cliente.
 *
 * Campos opcionais aceitam string vazia (o input HTML sempre envia "") e a
 * normalização "" → null acontece na camada de serviço. Evitamos
 * `z.preprocess`/transforms para manter input === output (compatível com o
 * resolver do React Hook Form).
 */
const optionalText = z.string().max(500).optional();

const isEmail = (v: string) => z.string().email().safeParse(v).success;

export const clienteFormSchema = z.object({
  tipo: z.enum(["pf", "pj"]),
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome (mínimo 2 caracteres).")
    .max(200),
  documento: z
    .string()
    .refine((v) => v === "" || isValidCpfCnpj(v), "CPF/CNPJ inválido.")
    .optional(),
  rg: optionalText,
  data_nascimento: z.string().optional(),
  telefone: optionalText,
  whatsapp: optionalText,
  email: z
    .string()
    .refine((v) => v === "" || isEmail(v), "E-mail inválido.")
    .optional(),
  cep: optionalText,
  logradouro: optionalText,
  numero: optionalText,
  complemento: optionalText,
  bairro: optionalText,
  cidade: optionalText,
  estado: z
    .string()
    .refine((v) => v === "" || v.length === 2, "UF deve ter 2 letras.")
    .optional(),
  observacoes: z.string().max(2000).optional(),
  status: z.enum(["ativo", "inativo", "inadimplente"]),
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;

/** Valores iniciais do formulário (criação). */
export const clienteFormDefaults: ClienteFormValues = {
  tipo: "pf",
  nome: "",
  documento: "",
  rg: "",
  data_nascimento: "",
  telefone: "",
  whatsapp: "",
  email: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  observacoes: "",
  status: "ativo",
};

/** Filtros da listagem (via URL). */
export const clientesFilterSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["ativo", "inativo", "inadimplente"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["nome", "created_at"]).default("nome"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ClientesFilter = z.infer<typeof clientesFilterSchema>;
