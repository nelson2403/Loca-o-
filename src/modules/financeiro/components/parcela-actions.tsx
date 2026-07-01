"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Barcode,
  CheckCircle2,
  MessageSquare,
  MoreHorizontal,
  QrCode,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  baixaFormSchema,
  type BaixaFormValues,
} from "@/modules/financeiro/schemas/financeiro.schema";
import {
  baixarParcelaAction,
  estornarParcelaAction,
  cancelarParcelaAction,
} from "@/modules/financeiro/actions";
import { gerarCobrancaAction } from "@/modules/financeiro/asaas-actions";
import { enviarMensagemParcelaAction } from "@/modules/mensagens/actions";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { Enums } from "@/types/database.types";

interface ParcelaActionsProps {
  id: string;
  valor: number;
  status: Enums<"parcela_status">;
}

export function ParcelaActions({ id, valor, status }: ParcelaActionsProps) {
  const router = useRouter();
  const [baixaOpen, setBaixaOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BaixaFormValues>({
    resolver: zodResolver(baixaFormSchema),
    defaultValues: {
      data_pagamento: new Date().toISOString().slice(0, 10),
      valor_pago: String(valor),
      forma_pagamento: "pix",
    },
  });

  function onBaixa(values: BaixaFormValues) {
    startTransition(async () => {
      const result = await baixarParcelaAction(id, values);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao dar baixa.");
        return;
      }
      toast.success("Baixa registrada.");
      setBaixaOpen(false);
      router.refresh();
    });
  }

  function runSimple(
    action: () => Promise<{ success: boolean; error?: string }>,
    okMsg: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        toast.error(result.error ?? "Operação falhou.");
        return;
      }
      toast.success(okMsg);
      router.refresh();
    });
  }

  const isPago = status === "pago";
  const isCancelado = status === "cancelado";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isPago && !isCancelado ? (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setBaixaOpen(true);
              }}
            >
              <CheckCircle2 className="mr-2 size-4" />
              Dar baixa
            </DropdownMenuItem>
          ) : null}
          {isPago ? (
            <DropdownMenuItem
              onSelect={() =>
                runSimple(
                  () => estornarParcelaAction(id),
                  "Pagamento estornado.",
                )
              }
            >
              <RotateCcw className="mr-2 size-4" />
              Estornar
            </DropdownMenuItem>
          ) : null}
          {!isPago && !isCancelado ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() =>
                  runSimple(
                    () => gerarCobrancaAction(id, "BOLETO"),
                    "Boleto gerado no ASAAS.",
                  )
                }
              >
                <Barcode className="mr-2 size-4" />
                Gerar boleto (ASAAS)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  runSimple(
                    () => gerarCobrancaAction(id, "PIX"),
                    "Cobrança PIX gerada no ASAAS.",
                  )
                }
              >
                <QrCode className="mr-2 size-4" />
                Gerar PIX (ASAAS)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  runSimple(
                    () => enviarMensagemParcelaAction(id, "cobranca"),
                    "Cobrança enviada por WhatsApp.",
                  )
                }
              >
                <MessageSquare className="mr-2 size-4" />
                Enviar cobrança (WhatsApp)
              </DropdownMenuItem>
            </>
          ) : null}
          {!isCancelado ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() =>
                  runSimple(
                    () => cancelarParcelaAction(id),
                    "Parcela cancelada.",
                  )
                }
              >
                <XCircle className="mr-2 size-4" />
                Cancelar parcela
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={baixaOpen} onOpenChange={setBaixaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar baixa na parcela</DialogTitle>
            <DialogDescription>
              Registre o recebimento desta parcela.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onBaixa)}
              className="space-y-4"
              id="baixa-form"
            >
              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor pago (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="forma_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">
                          Transferência
                        </SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBaixaOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" form="baixa-form" disabled={isPending}>
              {isPending ? "Salvando..." : "Confirmar baixa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
