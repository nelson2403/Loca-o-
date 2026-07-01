import "server-only";

import {
  createCustomer,
  createPayment,
  getPixQrCode,
  getBoletoLinhaDigitavel,
  type AsaasPayment,
} from "@/lib/integrations/asaas/client";
import {
  getClienteById,
  updateClienteRow,
} from "@/modules/clientes/repositories/clientes.repository";
import {
  getParcelaById,
  updateParcelaRow,
} from "@/modules/financeiro/repositories/parcelas.repository";
import { getContratoById } from "@/modules/contratos/repositories/contratos.repository";
import type { Tables } from "@/types/database.types";

export type BillingType = "BOLETO" | "PIX";

/** Garante que o cliente tenha um customer no ASAAS (cria se necessário). */
async function ensureAsaasCustomer(
  cliente: Tables<"clientes">,
): Promise<string> {
  if (cliente.asaas_customer_id) return cliente.asaas_customer_id;

  const customer = await createCustomer({
    name: cliente.nome,
    cpfCnpj: cliente.documento,
    email: cliente.email,
    mobilePhone: cliente.whatsapp ?? cliente.telefone,
  });

  await updateClienteRow(cliente.id, { asaas_customer_id: customer.id });
  return customer.id;
}

export interface GerarCobrancaResult {
  parcelaId: string;
  asaasPaymentId: string;
}

/**
 * Gera uma cobrança no ASAAS para uma parcela e persiste os dados de
 * boleto/PIX na própria parcela.
 */
export async function gerarCobranca(
  parcelaId: string,
  billingType: BillingType,
): Promise<GerarCobrancaResult> {
  const parcela = await getParcelaById(parcelaId);
  if (!parcela) throw new Error("Parcela não encontrada.");
  if (parcela.asaas_payment_id) {
    return { parcelaId, asaasPaymentId: parcela.asaas_payment_id };
  }

  const contrato = await getContratoById(parcela.contrato_id);
  if (!contrato) throw new Error("Contrato não encontrado.");

  const cliente = await getClienteById(contrato.cliente_id);
  if (!cliente) throw new Error("Cliente não encontrado.");

  const customerId = await ensureAsaasCustomer(cliente);

  const payment: AsaasPayment = await createPayment({
    customer: customerId,
    billingType,
    value: parcela.valor,
    dueDate: parcela.vencimento,
    description: `Parcela ${parcela.numero} - contrato ${contrato.numero ?? contrato.id}`,
    externalReference: parcela.id,
  });

  // Dados complementares de boleto/PIX.
  let linhaDigitavel: string | null = payment.identificationField ?? null;
  let codigoBarras: string | null = payment.barCode ?? null;
  let pixCopiaCola: string | null = null;
  let pixQrcode: string | null = null;

  try {
    if (billingType === "BOLETO") {
      const boleto = await getBoletoLinhaDigitavel(payment.id);
      linhaDigitavel = boleto.identificationField ?? linhaDigitavel;
      codigoBarras = boleto.barCode ?? codigoBarras;
    } else {
      const pix = await getPixQrCode(payment.id);
      pixCopiaCola = pix.payload ?? null;
      pixQrcode = pix.encodedImage ?? null;
    }
  } catch (error) {
    console.error("[gerarCobranca] detalhes boleto/pix:", error);
  }

  await updateParcelaRow(parcela.id, {
    asaas_payment_id: payment.id,
    nosso_numero: payment.nossoNumero ?? null,
    linha_digitavel: linhaDigitavel,
    codigo_barras: codigoBarras,
    pix_copia_cola: pixCopiaCola,
    pix_qrcode: pixQrcode,
    boleto_url: payment.bankSlipUrl ?? payment.invoiceUrl ?? null,
  });

  return { parcelaId: parcela.id, asaasPaymentId: payment.id };
}
