import { z } from "zod";

const optionalText = z.string().max(500).optional();

const money = z
  .string()
  .refine(
    (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
    "Valor inválido.",
  )
  .optional();

const currentYear = new Date().getFullYear();

export const veiculoFormSchema = z.object({
  marca: z.string().trim().min(1, "Informe a marca.").max(60),
  modelo: z.string().trim().min(1, "Informe o modelo.").max(80),
  ano: z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (/^\d{4}$/.test(v) &&
          Number(v) >= 1900 &&
          Number(v) <= currentYear + 1),
      "Ano inválido.",
    )
    .optional(),
  placa: optionalText,
  renavam: optionalText,
  chassi: optionalText,
  cor: optionalText,
  valor_aluguel: money,
  status: z.enum(["disponivel", "locado", "manutencao", "inativo"]),
  observacoes: z.string().max(2000).optional(),
});

export type VeiculoFormValues = z.infer<typeof veiculoFormSchema>;

export const veiculoFormDefaults: VeiculoFormValues = {
  marca: "",
  modelo: "",
  ano: "",
  placa: "",
  renavam: "",
  chassi: "",
  cor: "",
  valor_aluguel: "",
  status: "disponivel",
  observacoes: "",
};

export const veiculosFilterSchema = z.object({
  q: z.string().optional(),
  status: z
    .enum(["disponivel", "locado", "manutencao", "inativo"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["marca", "created_at"]).default("marca"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type VeiculosFilter = z.infer<typeof veiculosFilterSchema>;
