import { publicEnv } from "@/lib/env";

/**
 * Metadados globais da aplicação. Fonte única de verdade para nome, descrição
 * e URL base — usados em `metadata`, e-mails, WhatsApp e SEO.
 */
export const siteConfig = {
  name: "Locações",
  fullName: "Sistema de Gestão de Locações",
  description:
    "Gestão completa de locações de imóveis e veículos: contratos, carnês, cobranças e automações.",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  locale: "pt-BR",
  currency: "BRL",
  timezone: "America/Sao_Paulo",
} as const;

export type SiteConfig = typeof siteConfig;
