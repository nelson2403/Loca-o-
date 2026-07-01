"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Campos {
  nome?: string;
  documento?: string;
  valor?: string;
  data_inicio?: string;
  data_fim?: string;
  dia_vencimento?: string;
  qtd_parcelas?: string;
  cep?: string;
  endereco?: string;
}

export function ImportarPdf() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [campos, setCampos] = useState<Campos | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setCampos(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/contratos/importar-pdf", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Falha ao ler o PDF.");
        return;
      }
      setCampos(json.campos ?? {});
      toast.success("PDF lido. Confira os dados extraídos.");
    } catch {
      toast.error("Erro ao enviar o PDF.");
    } finally {
      setLoading(false);
    }
  }

  function update(key: keyof Campos, value: string) {
    setCampos((c) => ({ ...c, [key]: value }));
  }

  function continuar() {
    const params = new URLSearchParams();
    for (const key of [
      "valor",
      "data_inicio",
      "data_fim",
      "dia_vencimento",
      "qtd_parcelas",
    ] as const) {
      const v = campos?.[key];
      if (v) params.set(key, v);
    }
    router.push(`/contratos/novo?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Enviar PDF do contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="pdf"
            className="hover:bg-accent flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors"
          >
            {loading ? (
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            ) : (
              <FileUp className="text-muted-foreground size-8" />
            )}
            <span className="text-sm font-medium">
              {loading ? "Lendo o PDF..." : "Clique para selecionar um PDF"}
            </span>
            <span className="text-muted-foreground text-xs">
              Extraímos os dados automaticamente para conferência.
            </span>
            <input
              id="pdf"
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={loading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        </CardContent>
      </Card>

      {campos ? (
        <Card>
          <CardHeader>
            <CardTitle>2. Conferência dos dados</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Review label="Cliente" value={campos.nome} onChange={(v) => update("nome", v)} />
            <Review label="CPF/CNPJ" value={campos.documento} onChange={(v) => update("documento", v)} />
            <Review label="Valor (R$)" value={campos.valor} onChange={(v) => update("valor", v)} />
            <Review label="Qtd. parcelas" value={campos.qtd_parcelas} onChange={(v) => update("qtd_parcelas", v)} />
            <Review label="Data início" value={campos.data_inicio} onChange={(v) => update("data_inicio", v)} type="date" />
            <Review label="Data fim" value={campos.data_fim} onChange={(v) => update("data_fim", v)} type="date" />
            <Review label="Dia vencimento" value={campos.dia_vencimento} onChange={(v) => update("dia_vencimento", v)} />
            <Review label="CEP" value={campos.cep} onChange={(v) => update("cep", v)} />
            <div className="sm:col-span-2">
              <Review label="Endereço" value={campos.endereco} onChange={(v) => update("endereco", v)} />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={continuar}>
                Continuar para o novo contrato
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Review({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
