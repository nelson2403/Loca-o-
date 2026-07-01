import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getConfiguracoes } from "@/modules/configuracoes/repositories/config.repository";
import { ConfigForm } from "@/modules/configuracoes/components/config-form";
import { DEFAULT_TEMPLATES } from "@/lib/integrations/evolution/templates";
import type { ConfigFormValues } from "@/modules/configuracoes/schemas/config.schema";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function ConfiguracoesPage() {
  const config = await getConfiguracoes();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const templates = (config?.templates as any) ?? {};
  const automacoes = (config?.automacoes as any) ?? {};
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const defaults: ConfigFormValues = {
    empresa_nome: config?.empresa_nome ?? "",
    empresa_documento: config?.empresa_documento ?? "",
    empresa_telefone: config?.empresa_telefone ?? "",
    empresa_email: config?.empresa_email ?? "",
    lembrete_dias_antes: String(automacoes.lembrete_dias_antes ?? 3),
    cobranca_apos_dias: String(automacoes.cobranca_apos_dias ?? 1),
    enviar_whatsapp: Boolean(automacoes.enviar_whatsapp ?? false),
    gerar_cobranca_asaas: Boolean(automacoes.gerar_cobranca_asaas ?? false),
    enviar_recibo: Boolean(automacoes.enviar_recibo ?? true),
    tpl_lembrete: templates.lembrete ?? DEFAULT_TEMPLATES.lembrete,
    tpl_cobranca: templates.cobranca ?? DEFAULT_TEMPLATES.cobranca,
    tpl_cobranca_atraso:
      templates.cobranca_atraso ?? DEFAULT_TEMPLATES.cobranca_atraso,
    tpl_recibo: templates.recibo ?? DEFAULT_TEMPLATES.recibo,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados da empresa, automações e templates de mensagem."
      />
      <ConfigForm defaultValues={defaults} />
    </div>
  );
}
