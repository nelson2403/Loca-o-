"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(observabilidade): enviar para serviço de logging (ex.: Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">
        Algo deu errado
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ocorreu um erro inesperado. Tente novamente. Se o problema persistir,
        contate o suporte.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
