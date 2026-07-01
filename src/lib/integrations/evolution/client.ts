import "server-only";

import { serverEnv } from "@/lib/env";
import { onlyDigits } from "@/lib/validators/documento";

/**
 * Cliente da Evolution API (WhatsApp), server-only.
 * Docs: https://doc.evolution-api.com/
 */

export function isEvolutionConfigured(): boolean {
  try {
    const env = serverEnv();
    return Boolean(
      env.EVOLUTION_API_URL && env.EVOLUTION_API_KEY && env.EVOLUTION_INSTANCE,
    );
  } catch {
    return false;
  }
}

export class EvolutionError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "EvolutionError";
  }
}

/** Normaliza o número para o formato E.164 sem símbolos (DDI 55 por padrão). */
export function normalizePhone(phone: string): string {
  let d = onlyDigits(phone);
  if (d.length <= 11) d = `55${d}`; // adiciona DDI Brasil se ausente
  return d;
}

export interface SendTextResult {
  providerId: string | null;
}

export async function sendText(
  phone: string,
  text: string,
): Promise<SendTextResult> {
  const env = serverEnv();
  if (!isEvolutionConfigured()) {
    throw new EvolutionError("Evolution API não configurada.");
  }

  const url = `${env.EVOLUTION_API_URL}/message/sendText/${env.EVOLUTION_INSTANCE}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.EVOLUTION_API_KEY as string,
    },
    body: JSON.stringify({
      number: normalizePhone(phone),
      text,
    }),
    cache: "no-store",
  });

  const body = await res.text();
  if (!res.ok) {
    throw new EvolutionError(
      `Falha ao enviar WhatsApp (${res.status}): ${body.slice(0, 200)}`,
      res.status,
    );
  }

  let providerId: string | null = null;
  try {
    const json = JSON.parse(body);
    providerId = json?.key?.id ?? json?.messageId ?? null;
  } catch {
    // resposta não-JSON — ignora
  }
  return { providerId };
}
