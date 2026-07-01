import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendText, isEvolutionConfigured } from "@/lib/integrations/evolution/client";
import {
  DEFAULT_TEMPLATES,
  renderTemplate,
  type TemplateKey,
} from "@/lib/integrations/evolution/templates";
import { insertMensagem } from "@/modules/mensagens/repositories/mensagens.repository";
import { formatCurrency, formatDate } from "@/lib/formatters";

export interface EnvioResult {
  success: boolean;
  error?: string;
  mensagemId?: string;
}

/**
 * Envia uma mensagem de WhatsApp referente a uma parcela, usando o template
 * indicado (com fallback para o texto padrão). Usa service_role para ler os
 * dados — funciona tanto em Server Actions quanto em jobs/cron.
 *
 * Sempre registra a tentativa em `mensagens` (enviado/erro).
 */
export async function enviarMensagemParcela(
  parcelaId: string,
  templateKey: TemplateKey,
): Promise<EnvioResult> {
  const admin = createSupabaseAdminClient();

  // Dados da parcela + contrato + cliente + config (em uma ida controlada).
  const { data: parcela } = await admin
    .from("parcelas")
    .select("*, contrato:contratos(*, cliente:clientes(*))")
    .eq("id", parcelaId)
    .maybeSingle();

  if (!parcela) return { success: false, error: "Parcela não encontrada." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contrato = (parcela as any).contrato;
  const cliente = contrato?.cliente;
  if (!cliente) return { success: false, error: "Cliente não encontrado." };

  const telefone: string | null = cliente.whatsapp ?? cliente.telefone;
  if (!telefone) {
    return { success: false, error: "Cliente sem telefone/WhatsApp." };
  }

  // Template configurável (Configurações) com fallback no padrão.
  const { data: config } = await admin
    .from("configuracoes")
    .select("templates, empresa_nome")
    .eq("org_id", parcela.org_id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const custom = (config?.templates as any) ?? {};
  const template: string = custom[templateKey] ?? DEFAULT_TEMPLATES[templateKey];

  const conteudo = renderTemplate(template, {
    cliente: cliente.nome,
    parcela: parcela.numero,
    valor: formatCurrency(parcela.valor),
    vencimento: formatDate(parcela.vencimento),
    link: parcela.boleto_url ?? parcela.pix_copia_cola ?? "",
    empresa: config?.empresa_nome ?? "",
  });

  if (!isEvolutionConfigured()) {
    await insertMensagem({
      org_id: parcela.org_id,
      template: templateKey,
      telefone,
      conteudo,
      cliente_id: cliente.id,
      contrato_id: contrato.id,
      parcela_id: parcela.id,
      status: "erro",
      erro: "Evolution API não configurada.",
    });
    return { success: false, error: "Evolution API não configurada." };
  }

  try {
    const { providerId } = await sendText(telefone, conteudo);
    const mensagem = await insertMensagem({
      org_id: parcela.org_id,
      template: templateKey,
      telefone,
      conteudo,
      cliente_id: cliente.id,
      contrato_id: contrato.id,
      parcela_id: parcela.id,
      status: "enviado",
      provider_id: providerId,
    });
    return { success: true, mensagemId: mensagem.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro no envio.";
    await insertMensagem({
      org_id: parcela.org_id,
      template: templateKey,
      telefone,
      conteudo,
      cliente_id: cliente.id,
      contrato_id: contrato.id,
      parcela_id: parcela.id,
      status: "erro",
      erro: msg,
    });
    return { success: false, error: msg };
  }
}
