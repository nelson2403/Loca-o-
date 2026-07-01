"use client";

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
import { maskCep, maskCpfCnpj, maskPhone } from "@/lib/masks";
import { BR_STATES } from "@/lib/constants/br";
import {
  clienteFormSchema,
  clienteFormDefaults,
  type ClienteFormValues,
} from "@/modules/clientes/schemas/cliente.schema";
import {
  createClienteAction,
  updateClienteAction,
} from "@/modules/clientes/actions";

interface ClienteFormProps {
  mode: "create" | "edit";
  clienteId?: string;
  defaultValues?: ClienteFormValues;
}

export function ClienteForm({
  mode,
  clienteId,
  defaultValues,
}: ClienteFormProps) {
  const router = useRouter();
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: defaultValues ?? clienteFormDefaults,
  });

  const tipo = form.watch("tipo");
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ClienteFormValues) {
    const result =
      mode === "create"
        ? await createClienteAction(values)
        : await updateClienteAction(clienteId!, values);

    if (!result.success) {
      toast.error(result.error ?? "Não foi possível salvar.");
      return;
    }

    toast.success(
      mode === "create" ? "Cliente criado com sucesso." : "Cliente atualizado.",
    );
    router.push("/clientes");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Identificação */}
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pf">Pessoa Física</SelectItem>
                      <SelectItem value="pj">Pessoa Jurídica</SelectItem>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="inadimplente">
                        Inadimplente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>
                    {tipo === "pj" ? "Razão social" : "Nome completo"}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tipo === "pj" ? "CNPJ" : "CPF"}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder={
                        tipo === "pj"
                          ? "00.000.000/0000-00"
                          : "000.000.000-00"
                      }
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(maskCpfCnpj(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG / Inscrição</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipo === "pf" ? (
              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="(00) 0000-0000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="(00) 00000-0000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="cliente@email.com"
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

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskCep(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logradouro"
              render={({ field }) => (
                <FormItem className="sm:col-span-4">
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem className="sm:col-span-4">
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>UF</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BR_STATES.map((s) => (
                        <SelectItem key={s.uf} value={s.uf}>
                          {s.uf} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Observações */}
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
                      rows={4}
                      placeholder="Anotações internas sobre o cliente..."
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
              "Criar cliente"
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
