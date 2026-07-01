import { siteConfig } from "@/config/site";

/** Formata um valor numérico (em reais) como moeda brasileira. */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
  }).format(value);
}

/** Formata uma data (Date | ISO string) no padrão brasileiro dd/MM/yyyy. */
export function formatDate(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(siteConfig.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: siteConfig.timezone,
  }).format(date);
}

/** Formata data e hora (dd/MM/yyyy HH:mm). */
export function formatDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(siteConfig.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: siteConfig.timezone,
  }).format(date);
}

/** Aplica máscara visual em CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00). */
export function formatDocument(doc: string | null | undefined): string {
  if (!doc) return "—";
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  }
  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }
  return doc;
}

/** Aplica máscara visual em telefone brasileiro. */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}
