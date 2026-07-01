"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/shared/combobox";
import { formatCurrency } from "@/lib/formatters";
import { generateParcelasSchedule } from "@/lib/carne";
import {
  contratoFormSchema,
  contratoFormDefaults,
  type ContratoFormValues,
} from "@/modules/contratos/schemas/contrato.schema";
import {
  createContratoAction,
  updateContratoAction,
} from "@/modules/contratos/actions";

interface ContratoFormProps {
  mode: "create" | "edit";
  contratoId?: string;
  defaultValues?: ContratoFormValues;
  clientes: ComboboxOption[];
  imoveis: ComboboxOption[];
  veiculos: ComboboxOption[];
}

export function ContratoForm({
  mode,
  contratoId,
  defaultValues,
  clientes,
  imoveis,
  veiculos,
}: ContratoFormProps) {
  const router = useRouter();
  const form = useForm<ContratoFormValues>({
    resolver: zodResolver(contratoFormSchema),
    defaultValues: defaultValues ?? contratoFormDefaults,
  });

  const tipo = form.watch("tipo");
  const valor = form.watch("valor");
  const qtd = form.watch("qtd_parcelas");
  const dia = form.watch("dia_vencimento");
  const inicio = form.watch("data_inicio");
  const isSubmitting = form.formState.isSubmitting;

  // Prévia do carnê (calculada no cliente, só para conferência visual).
  const preview = useMemo(() => {
    const v = Number(valor);
    const n = Number(qtd);
    const d = Number(dia);
    if (!v || !n || !d || !inicio) return null;
    const schedule = generateParcelasSchedule({
      valor: v,
      qtdParcelas: Math.min(n, 360),
      diaVencimento: d,
      dataInicio: inicio,
    });
    return {
      count: schedule.length,
      total: v * schedule.length,
      first: schedule[0],
      last: schedule[schedule.length - 1],
    };
  }, [valor, qtd, dia, inicio]);

  async function onSubmit(values: ContratoFormValues) {
    const result =
      mode === "create"
        ? await createContratoAction(values)
        : await updateContratoAction(contratoId!, values);
    if (!result.success) {
      toast.error(result.error ?? "Não foi possível salvar.");
      return;
    }
    toast.success(
      mode === "create"
        ? "Contrato criado e carnê gerado."
        : "Contrato atualizado.",
    );
    router.push(result.id ? `/contratos/${result.id}` : "/contratos");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Partes do contrato</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de locação</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v);
                      // Limpa o alvo do outro tipo.
                      if (v === "imovel") form.setValue("veiculo_id", "");
                      else form.setValue("imovel_id", "");
                    }}
                    value={field.value}
                    disabled={mode === "edit"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="imovel">Imóvel</SelectItem>
                      <SelectItem value="veiculo">Veículo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Cliente</FormLabel>
                  <Combobox
                    options={clientes}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione o cliente"
                    searchPlaceholder="Buscar cliente..."
                    disabled={mode === "edit"}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipo === "imovel" ? (
              <FormField
                control={form.control}
                name="imovel_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:col-span-2">
                    <FormLabel>Imóvel</FormLabel>
                    <Combobox
                      options={imoveis}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione o imóvel"
                      searchPlaceholder="Buscar imóvel..."
                      disabled={mode === "edit"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:col-span-2">
                    <FormLabel>Veículo</FormLabel>
                    <Combobox
                      options={veiculos}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione o veículo"
                      searchPlaceholder="Buscar veículo..."
                      disabled={mode === "edit"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condições financeiras</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do contrato</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Opcional"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da parcela (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      disabled={mode === "edit"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Valor mensal do aluguel.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data inicial</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={mode === "edit"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data_fim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data final</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dia_vencimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do vencimento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      disabled={mode === "edit"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qtd_parcelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="360"
                      disabled={mode === "edit"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="indice_reajuste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Índice de reajuste</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="igpm">IGP-M</SelectItem>
                      <SelectItem value="ipca">IPCA</SelectItem>
                      <SelectItem value="incc">INCC</SelectItem>
                      <SelectItem value="nenhum">Sem reajuste</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="encerrado">Encerrado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="multa_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Multa (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="juros_mes_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Juros ao mês (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {mode === "create" && preview ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Prévia do carnê</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Parcelas</p>
                <p className="font-semibold">{preview.count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor total</p>
                <p className="font-semibold">{formatCurrency(preview.total)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">1ª parcela</p>
                <p className="font-semibold">{preview.first?.vencimento}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Última parcela</p>
                <p className="font-semibold">{preview.last?.vencimento}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Cláusulas, anotações..."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : mode === "create" ? (
              "Criar contrato e gerar carnê"
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
