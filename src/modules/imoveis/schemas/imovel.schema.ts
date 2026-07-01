import { z } from "zod";

const optionalText = z.string().max(500).optional();

/** Campo monetário como string; aceita vazio (vira 0) ou número >= 0. */
const money = z
  .string()
  .refine(
    (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Valor inválido.",
  )
  .optional();

export const imovelFormSchema = z.object({
  codigo: z.string().trim().min(1, "Informe o código interno.").max(50),
  tipo: z.enum([
    "casa",
    "apartamento",
    "comercial",
    "terreno",
    "galpao",
    "outro",
  ]),
  status: z.enum(["disponivel", "locado", "manutencao", "inativo"]),
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
  valor_aluguel: money,
  valor_condominio: money,
  valor_iptu: money,
  descricao: z.string().max(2000).optional(),
  observacoes: z.string().max(2000).optional(),
});

export type ImovelFormValues = z.infer<typeof imovelFormSchema>;

export const imovelFormDefaults: ImovelFormValues = {
  codigo: "",
  tipo: "casa",
  status: "disponivel",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  valor_aluguel: "",
  valor_condominio: "",
  valor_iptu: "",
  descricao: "",
  observacoes: "",
};

export const imoveisFilterSchema = z.object({
  q: z.string().optional(),
  status: z
    .enum(["disponivel", "locado", "manutencao", "inativo"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["codigo", "created_at"]).default("codigo"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ImoveisFilter = z.infer<typeof imoveisFilterSchema>;

export const IMOVEL_TIPO_LABEL: Record<ImovelFormValues["tipo"], string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  comercial: "Comercial",
  terreno: "Terreno",
  galpao: "Galpão",
  outro: "Outro",
};
