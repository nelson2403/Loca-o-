import "server-only";

import { serverEnv } from "@/lib/env";

/**
 * Cliente HTTP do ASAAS (server-only).
 *
 * Docs: https://docs.asaas.com/
 * Autenticação via header `access_token`. A base URL define sandbox x produção
 * (ver ASAAS_BASE_URL no .env).
 */

export function isAsaasConfigured(): boolean {
  try {
    return Boolean(serverEnv().ASAAS_API_KEY);
  } catch {
    return false;
  }
}

export class AsaasError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AsaasError";
  }
}

async function asaasFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const env = serverEnv();
  if (!env.ASAAS_API_KEY) {
    throw new AsaasError("ASAAS não configurado (ASAAS_API_KEY ausente).");
  }

  const res = await fetch(`${env.ASAAS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: env.ASAAS_API_KEY,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      body?.errors?.[0]?.description ?? `Erro ASAAS (${res.status}).`;
    throw new AsaasError(msg, res.status, body);
  }
  return body as T;
}

// --- Tipos (subset relevante) ---------------------------------------------

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj?: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  nossoNumero?: string;
  identificationField?: string; // linha digitável
  barCode?: string;
}

export interface AsaasPixQrCode {
  encodedImage?: string; // base64
  payload?: string; // copia e cola
}

// --- Operações ------------------------------------------------------------

export async function createCustomer(input: {
  name: string;
  cpfCnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      cpfCnpj: input.cpfCnpj ?? undefined,
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,
      mobilePhone: input.mobilePhone ?? undefined,
    }),
  });
}

export async function createPayment(input: {
  customer: string;
  billingType: "BOLETO" | "PIX" | "UNDEFINED";
  value: number;
  dueDate: string; // yyyy-MM-dd
  description?: string;
  externalReference?: string;
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPayment(id: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${id}`);
}

export async function getPixQrCode(
  paymentId: string,
): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export async function getBoletoLinhaDigitavel(
  paymentId: string,
): Promise<{ identificationField?: string; barCode?: string }> {
  return asaasFetch(`/payments/${paymentId}/identificationField`);
}

export async function cancelPayment(id: string): Promise<{ deleted: boolean }> {
  return asaasFetch(`/payments/${id}`, { method: "DELETE" });
}
