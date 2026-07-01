"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  configFormSchema,
  type ConfigFormValues,
} from "@/modules/configuracoes/schemas/config.schema";
import { updateConfigAction } from "@/modules/configuracoes/actions";

export function ConfigForm({
  defaultValues,
}: {
  defaultValues: ConfigFormValues;
}) {
  const router = useRouter();
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues,
  });
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ConfigFormValues) {
    const result = await updateConfigAction(values);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar.");
      return;
    }
    toast.success("Configurações salvas.");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="empresa">
          <TabsList>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="automacoes">Automações</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Dados da empresa</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field control={form.control} name="empresa_nome" label="Nome" />
                <Field
                  control={form.control}
                  name="empresa_documento"
                  label="CNPJ/CPF"
                />
                <Field
                  control={form.control}
                  name="empresa_telefone"
                  label="Telefone"
                />
                <Field
                  control={form.control}
                  name="empresa_email"
                  label="E-mail"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automacoes">
            <Card>
              <CardHeader>
                <CardTitle>Automações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    control={form.control}
                    name="lembrete_dias_antes"
                    label="Lembrete: dias antes do vencimento"
                    type="number"
                  />
                  <Field
                    control={form.control}
                    name="cobranca_apos_dias"
                    label="Cobrança: dias após o vencimento"
                    type="number"
                  />
                </div>
                <CheckboxField
                  control={form.control}
                  name="enviar_whatsapp"
                  label="Enviar mensagens automáticas por WhatsApp"
                  description="Ativa lembretes e cobranças automáticas (requer Evolution API configurada)."
                />
                <CheckboxField
                  control={form.control}
                  name="gerar_cobranca_asaas"
                  label="Gerar cobranças no ASAAS automaticamente"
                  description="Requer ASAAS configurado."
                />
                <CheckboxField
                  control={form.control}
                  name="enviar_recibo"
                  label="Enviar recibo automático após pagamento"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Templates de mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Variáveis disponíveis: {"{{cliente}}"}, {"{{parcela}}"},{" "}
                  {"{{valor}}"}, {"{{vencimento}}"}, {"{{link}}"},{" "}
                  {"{{empresa}}"}.
                </p>
                <TextareaField
                  control={form.control}
                  name="tpl_lembrete"
                  label="Lembrete"
                />
                <TextareaField
                  control={form.control}
                  name="tpl_cobranca"
                  label="Cobrança"
                />
                <TextareaField
                  control={form.control}
                  name="tpl_cobranca_atraso"
                  label="Cobrança em atraso"
                />
                <TextareaField
                  control={form.control}
                  name="tpl_recibo"
                  label="Recibo"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar configurações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Field({
  control,
  name,
  label,
  type = "text",
}: {
  control: any;
  name: keyof ConfigFormValues;
  label: string;
  type?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} value={field.value ?? ""} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextareaField({
  control,
  name,
  label,
}: {
  control: any;
  name: keyof ConfigFormValues;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea rows={3} value={field.value ?? ""} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CheckboxField({
  control,
  name,
  label,
  description,
}: {
  control: any;
  name: keyof ConfigFormValues;
  label: string;
  description?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-3">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
          </div>
        </FormItem>
      )}
    />
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
