# Banco de Dados — Modelo e Aplicação

Este documento descreve o schema (Fase 1) e como aplicá-lo ao seu projeto
Supabase.

## Visão geral do modelo

```
organizations ──1:N── profiles ──1:1── auth.users
      │
      ├──1:N── clientes
      ├──1:N── imoveis
      ├──1:N── veiculos
      ├──1:N── contratos ──┬── cliente_id → clientes
      │                     ├── imovel_id  → imoveis   (tipo = 'imovel')
      │                     └── veiculo_id → veiculos  (tipo = 'veiculo')
      │                          │
      │                          └──1:N── parcelas (carnê)
      ├──1:N── documentos   (anexos — ref. polimórfica + Storage)
      └──1:N── audit_log    (histórico imutável)
```

### Tabelas

| Tabela          | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| `organizations` | Empresas (tenant). Hoje uma só; base do multitenancy futuro.     |
| `profiles`      | Perfil do usuário (org + papel). 1:1 com `auth.users`.           |
| `clientes`      | Pessoas físicas/jurídicas.                                       |
| `imoveis`       | Imóveis locáveis.                                                |
| `veiculos`      | Veículos locáveis.                                               |
| `contratos`     | Contratos (imóvel **ou** veículo).                               |
| `parcelas`      | Cobranças do carnê geradas por contrato.                         |
| `documentos`    | Metadados de anexos (arquivo no Storage).                        |
| `audit_log`     | Histórico de ações (quem/o quê/quando/IP).                       |

### Papéis de acesso (RLS)

- **admin** — acesso total, incluindo exclusão.
- **operador** — cria e edita (sem exclusão).
- **leitura** — somente leitura.

Todo usuário novo entra como **admin** na organização padrão (ajustável depois).
A `service_role` (servidor: webhooks/jobs) **bypassa a RLS** por design.

---

## Como aplicar as migrations

Você tem duas opções. A **Opção A (CLI)** é a recomendada — versiona e repete
com segurança.

### Opção A — Supabase CLI (recomendada)

```bash
# 1. Login (abre o navegador)
npx supabase login

# 2. Vincular ao seu projeto (pega o Reference ID em
#    Project Settings → General → Reference ID)
npx supabase link --project-ref SEU_PROJECT_REF

# 3. Aplicar todas as migrations ao banco remoto
npx supabase db push
```

> O `db push` pedirá a **senha do banco** (a que você definiu ao criar o projeto).

### Opção B — SQL Editor (manual)

No painel do Supabase → **SQL Editor** → **New query**, cole e execute o conteúdo
dos arquivos de `supabase/migrations/` **na ordem numérica**:

1. `20260701000001_foundation.sql`
2. `20260701000002_clientes.sql`
3. `20260701000003_imoveis_veiculos.sql`
4. `20260701000004_contratos_parcelas.sql`
5. `20260701000005_documentos_auditoria.sql`
6. `20260701000006_rls.sql`
7. `20260701000007_storage.sql`

---

## Criar o primeiro usuário (login)

O sistema usa autenticação por e-mail/senha. Crie o usuário admin:

1. Painel Supabase → **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Informe e-mail e senha e marque **Auto Confirm User** (para poder logar sem
   confirmar e-mail).
3. Um `profile` é criado automaticamente (trigger `on_auth_user_created`) já
   vinculado à organização padrão, com papel **admin**.

Agora é só entrar em `/login` com esse e-mail/senha.

> Dica: para desabilitar o cadastro público, vá em **Authentication → Providers
> → Email** e desative "Enable Sign Ups" (o sistema é de uso interno).

---

## Gerar os tipos TypeScript

Após aplicar o schema, gere os tipos para o app ficar totalmente tipado:

```bash
# Com o projeto vinculado (Opção A):
npx supabase gen types typescript --linked > src/types/database.types.ts
```

Isso substitui o placeholder em `src/types/database.types.ts`.

---

## Reset / reaplicar (ambiente de desenvolvimento)

Se precisar recomeçar o schema no ambiente **remoto de desenvolvimento**:

```bash
npx supabase db reset --linked   # ⚠️ APAGA os dados. Use só em dev.
```
