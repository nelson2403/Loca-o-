import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

/**
 * Webhook do ASAAS.
 *
 * Segurança: valida o header `asaas-access-token` contra ASAAS_WEBHOOK_TOKEN.
 * Idempotência: registra o evento em `asaas_webhook_events` (event_id unique).
 * Ação: em pagamentos recebidos/confirmados, dá baixa na parcela correspondente.
 *
 * Roda com service_role (sem sessão de usuário) — por isso está fora da RLS.
 */
export async function POST(request: NextRequest) {
  const env = serverEnv();

  // 1. Validação do token (se configurado).
  if (env.ASAAS_WEBHOOK_TOKEN) {
    const token = request.headers.get("asaas-access-token");
    if (token !== env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let body: {
    id?: string;
    event?: string;
    payment?: {
      id?: string;
      status?: string;
      value?: number;
      externalReference?: string;
      paymentDate?: string;
      billingType?: string;
    };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const eventId = body.id ?? `${body.event}:${body.payment?.id}`;

  // 2. Idempotência — ignora eventos já processados.
  const { data: existing } = await admin
    .from("asaas_webhook_events")
    .select("id, processed")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!existing) {
    await admin.from("asaas_webhook_events").insert({
      event_id: eventId,
      event_type: body.event ?? null,
      payload: body as unknown as Json,
    });
  }

  // 3. Processamento.
  try {
    const paidEvents = ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"];
    const payment = body.payment;

    if (payment?.id && body.event && paidEvents.includes(body.event)) {
      await admin
        .from("parcelas")
        .update({
          status: "pago",
          valor_pago: payment.value ?? null,
          data_pagamento:
            payment.paymentDate ?? new Date().toISOString().slice(0, 10),
        })
        .eq("asaas_payment_id", payment.id);
    }

    if (
      payment?.id &&
      (body.event === "PAYMENT_OVERDUE")
    ) {
      await admin
        .from("parcelas")
        .update({ status: "atrasado" })
        .eq("asaas_payment_id", payment.id);
    }

    await admin
      .from("asaas_webhook_events")
      .update({ processed: true })
      .eq("event_id", eventId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[asaas webhook]", error);
    await admin
      .from("asaas_webhook_events")
      .update({ error: String(error) })
      .eq("event_id", eventId);
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }
}
