import { z } from "zod";

export const financeiroFilterSchema = z.object({
  status: z
    .enum(["pendente", "pago", "atrasado", "cancelado", "isento"])
    .optional(),
  from: z.string().optional(), // yyyy-MM-dd (vencimento inicial)
  to: z.string().optional(), // yyyy-MM-dd (vencimento final)
  page: z.coerce.number().int().min(1).default(1),
});

export type FinanceiroFilter = z.infer<typeof financeiroFilterSchema>;

/** Formulário de baixa (marcar parcela como paga). */
export const baixaFormSchema = z.object({
  data_pagamento: z.string().min(1, "Informe a data do pagamento."),
  valor_pago: z
    .string()
    .refine(
      (v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Valor inválido.",
    ),
  forma_pagamento: z.enum([
    "boleto",
    "pix",
    "dinheiro",
    "transferencia",
    "cartao",
    "outro",
  ]),
});

export type BaixaFormValues = z.infer<typeof baixaFormSchema>;
