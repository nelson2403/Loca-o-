import { z } from "zod";

const intStr = z
  .string()
  .refine((v) => /^\d+$/.test(v) && Number(v) >= 0, "Número inválido.");

export const configFormSchema = z.object({
  empresa_nome: z.string().max(200).optional(),
  empresa_documento: z.string().max(20).optional(),
  empresa_telefone: z.string().max(20).optional(),
  empresa_email: z
    .string()
    .refine(
      (v) => v === "" || z.string().email().safeParse(v).success,
      "E-mail inválido.",
    )
    .optional(),

  lembrete_dias_antes: intStr,
  cobranca_apos_dias: intStr,
  enviar_whatsapp: z.boolean(),
  gerar_cobranca_asaas: z.boolean(),
  enviar_recibo: z.boolean(),

  tpl_lembrete: z.string().max(1000).optional(),
  tpl_cobranca: z.string().max(1000).optional(),
  tpl_cobranca_atraso: z.string().max(1000).optional(),
  tpl_recibo: z.string().max(1000).optional(),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;
