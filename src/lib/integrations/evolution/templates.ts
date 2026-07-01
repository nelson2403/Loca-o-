/**
 * Templates de mensagem (WhatsApp) com interpolação de variáveis `{{chave}}`.
 * Os textos padrão podem ser sobrescritos nas Configurações (jsonb `templates`).
 */

export type TemplateKey =
  | "lembrete"
  | "cobranca"
  | "cobranca_atraso"
  | "recibo"
  | "boas_vindas";

export const DEFAULT_TEMPLATES: Record<TemplateKey, string> = {
  lembrete:
    "Olá, {{cliente}}! Passando para lembrar que sua parcela nº {{parcela}} no valor de {{valor}} vence em {{vencimento}}. Qualquer dúvida, estamos à disposição.",
  cobranca:
    "Olá, {{cliente}}! Sua parcela nº {{parcela}} de {{valor}} venceu em {{vencimento}}. Para regularizar: {{link}}",
  cobranca_atraso:
    "Olá, {{cliente}}. Identificamos que a parcela nº {{parcela}} ({{valor}}, venc. {{vencimento}}) segue em aberto. Pedimos a gentileza de regularizar. {{link}}",
  recibo:
    "Recebemos o pagamento da parcela nº {{parcela}} no valor de {{valor}}. Obrigado, {{cliente}}!",
  boas_vindas:
    "Olá, {{cliente}}! Seu contrato foi registrado com sucesso. Em breve você receberá as informações das parcelas.",
};

export interface TemplateVars {
  cliente?: string;
  parcela?: string | number;
  valor?: string;
  vencimento?: string;
  link?: string;
  empresa?: string;
}

/** Substitui `{{chave}}` pelas variáveis fornecidas. */
export function renderTemplate(
  template: string,
  vars: TemplateVars,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = (vars as Record<string, unknown>)[key];
    return value === undefined || value === null ? "" : String(value);
  });
}
