import { z } from "zod";

const decimal = (msg: string) =>
  z.string().refine(
    (v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0,
    msg,
  );

export const contratoFormSchema = z
  .object({
    tipo: z.enum(["imovel", "veiculo"]),
    cliente_id: z.string().uuid("Selecione um cliente."),
    imovel_id: z.string().uuid().optional().or(z.literal("")),
    veiculo_id: z.string().uuid().optional().or(z.literal("")),
    numero: z.string().max(50).optional(),
    valor: decimal("Informe o valor da parcela."),
    data_inicio: z.string().min(1, "Informe a data inicial."),
    data_fim: z.string().min(1, "Informe a data final."),
    dia_vencimento: z
      .string()
      .refine(
        (v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 31,
        "Dia de vencimento inválido (1 a 31).",
      ),
    qtd_parcelas: z
      .string()
      .refine(
        (v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 360,
        "Quantidade de parcelas inválida (1 a 360).",
      ),
    indice_reajuste: z.enum(["igpm", "ipca", "incc", "nenhum"]),
    multa_percent: decimal("Informe a multa."),
    juros_mes_percent: decimal("Informe os juros."),
    observacoes: z.string().max(2000).optional(),
    status: z.enum(["rascunho", "ativo", "encerrado", "cancelado"]),
  })
  .refine(
    (data) =>
      data.tipo === "imovel"
        ? !!data.imovel_id
        : !!data.veiculo_id,
    {
      message: "Selecione o imóvel ou veículo do contrato.",
      path: ["imovel_id"],
    },
  )
  .refine((data) => data.data_fim >= data.data_inicio, {
    message: "A data final deve ser posterior à inicial.",
    path: ["data_fim"],
  });

export type ContratoFormValues = z.infer<typeof contratoFormSchema>;

export const contratoFormDefaults: ContratoFormValues = {
  tipo: "imovel",
  cliente_id: "",
  imovel_id: "",
  veiculo_id: "",
  numero: "",
  valor: "",
  data_inicio: "",
  data_fim: "",
  dia_vencimento: "10",
  qtd_parcelas: "12",
  indice_reajuste: "igpm",
  multa_percent: "2",
  juros_mes_percent: "1",
  observacoes: "",
  status: "ativo",
};

export const contratosFilterSchema = z.object({
  q: z.string().optional(),
  status: z
    .enum(["rascunho", "ativo", "encerrado", "cancelado"])
    .optional(),
  tipo: z.enum(["imovel", "veiculo"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type ContratosFilter = z.infer<typeof contratosFilterSchema>;

export const INDICE_LABEL: Record<
  ContratoFormValues["indice_reajuste"],
  string
> = {
  igpm: "IGP-M",
  ipca: "IPCA",
  incc: "INCC",
  nenhum: "Sem reajuste",
};
