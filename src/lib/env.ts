import { z } from "zod";

/**
 * Validação centralizada e tipada das variáveis de ambiente.
 *
 * - Variáveis `NEXT_PUBLIC_*` são expostas ao browser e validadas no
 *   `clientSchema`.
 * - As demais são exclusivas do servidor (nunca enviadas ao cliente) e
 *   validadas no `serverSchema`.
 *
 * A validação ocorre uma única vez na carga do módulo (padrão t3-env), o que
 * garante que qualquer configuração ausente/ inválida seja detectada cedo — no
 * boot do servidor — e não em runtime aleatório no meio de uma requisição.
 *
 * Durante o desenvolvimento sem credenciais reais, use os placeholders do
 * arquivo `.env.example` (copie para `.env.local`). Eles são sintaticamente
 * válidos e permitem que a aplicação suba sem integrações configuradas.
 */

/**
 * Trata strings vazias como `undefined`. No `.env`, uma variável não preenchida
 * costuma vir como "" — para campos opcionais isso deve equivaler a ausente,
 * evitando que `.min(1)` falhe indevidamente durante o build.
 */
const optionalString = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().url().optional(),
);

const serverSchema = z.object({
  // Supabase — chave de serviço (bypassa RLS). NUNCA expor ao cliente.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // ASAAS
  ASAAS_API_KEY: optionalString,
  ASAAS_BASE_URL: z.string().url().default("https://api-sandbox.asaas.com/v3"),
  ASAAS_WEBHOOK_TOKEN: optionalString,

  // Evolution API (WhatsApp)
  EVOLUTION_API_URL: optionalUrl,
  EVOLUTION_API_KEY: optionalString,
  EVOLUTION_INSTANCE: optionalString,

  // Segurança de rotas de automação (Vercel Cron / chamadas internas)
  CRON_SECRET: optionalString,

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

/**
 * Observação sobre Next.js: variáveis `NEXT_PUBLIC_*` precisam ser referenciadas
 * de forma estática para o bundler substituí-las. Por isso montamos o objeto
 * cliente explicitamente em vez de iterar sobre `process.env`.
 */
const processClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

function formatErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

const isServer = typeof window === "undefined";

const parsedClient = clientSchema.safeParse(processClientEnv);
if (!parsedClient.success) {
  throw new Error(
    `❌ Variáveis de ambiente públicas inválidas:\n${formatErrors(
      parsedClient.error,
    )}\n\nCopie o arquivo .env.example para .env.local e preencha os valores.`,
  );
}

let parsedServer: z.infer<typeof serverSchema> | undefined;
if (isServer) {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `❌ Variáveis de ambiente do servidor inválidas:\n${formatErrors(
        result.error,
      )}`,
    );
  }
  parsedServer = result.data;
}

/** Variáveis públicas — seguras para uso no cliente e no servidor. */
export const publicEnv = parsedClient.data;

/**
 * Variáveis do servidor. Só deve ser acessado em código server-only.
 * Lança erro se acessado no browser para evitar vazamento acidental.
 */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (!isServer || !parsedServer) {
    throw new Error(
      "serverEnv() foi chamado fora do servidor. Use apenas em código server-only.",
    );
  }
  return parsedServer;
}
