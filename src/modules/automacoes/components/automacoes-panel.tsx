"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Bell, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  runAtualizarStatusAction,
  runLembretesAction,
  runCobrancasAction,
  type RunResult,
} from "@/modules/automacoes/actions";

export function AutomacoesPanel() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<RunResult>) {
    startTransition(async () => {
      const r = await action();
      if (!r.success) {
        toast.error(r.error ?? "Falha ao executar.");
        return;
      }
      toast.success(r.message ?? "Executado.");
      router.refresh();
    });
  }

  const cards = [
    {
      title: "Atualizar status",
      description:
        "Marca como atrasadas as parcelas pendentes já vencidas. Agendado: todo dia 06:00.",
      icon: RefreshCw,
      action: runAtualizarStatusAction,
      label: "Executar agora",
    },
    {
      title: "Enviar lembretes",
      description:
        "Envia lembrete (WhatsApp) das parcelas que vencem em breve. Agendado: todo dia 09:00.",
      icon: Bell,
      action: runLembretesAction,
      label: "Executar agora",
    },
    {
      title: "Enviar cobranças",
      description:
        "Envia cobrança (WhatsApp) das parcelas vencidas. Agendado: todo dia 09:30.",
      icon: AlertCircle,
      action: runCobrancasAction,
      label: "Executar agora",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader>
            <c.icon className="text-muted-foreground size-5" />
            <CardTitle className="text-base">{c.title}</CardTitle>
            <CardDescription>{c.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => run(c.action)}
            >
              {c.label}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
