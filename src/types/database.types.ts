/**
 * Tipos do banco de dados Supabase.
 *
 * Escrito para refletir EXATAMENTE o schema em `supabase/migrations/`.
 * Pode ser regenerado a qualquer momento com:
 *   npx supabase gen types typescript --linked > src/types/database.types.ts
 * (mantém a mesma forma; este arquivo apenas adianta a tipagem.)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          document: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          document?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          document?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          org_id: string;
          full_name: string | null;
          email: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      clientes: {
        Row: {
          id: string;
          org_id: string;
          tipo: Database["public"]["Enums"]["pessoa_tipo"];
          nome: string;
          documento: string | null;
          rg: string | null;
          data_nascimento: string | null;
          telefone: string | null;
          whatsapp: string | null;
          email: string | null;
          cep: string | null;
          logradouro: string | null;
          numero: string | null;
          complemento: string | null;
          bairro: string | null;
          cidade: string | null;
          estado: string | null;
          asaas_customer_id: string | null;
          observacoes: string | null;
          status: Database["public"]["Enums"]["cliente_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          tipo?: Database["public"]["Enums"]["pessoa_tipo"];
          nome: string;
          documento?: string | null;
          rg?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          cep?: string | null;
          logradouro?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          asaas_customer_id?: string | null;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["cliente_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          tipo?: Database["public"]["Enums"]["pessoa_tipo"];
          nome?: string;
          documento?: string | null;
          rg?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          cep?: string | null;
          logradouro?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          asaas_customer_id?: string | null;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["cliente_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clientes_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      imoveis: {
        Row: {
          id: string;
          org_id: string;
          codigo: string;
          tipo: Database["public"]["Enums"]["imovel_tipo"];
          cep: string | null;
          logradouro: string | null;
          numero: string | null;
          complemento: string | null;
          bairro: string | null;
          cidade: string | null;
          estado: string | null;
          valor_aluguel: number;
          valor_condominio: number;
          valor_iptu: number;
          descricao: string | null;
          observacoes: string | null;
          status: Database["public"]["Enums"]["imovel_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          codigo: string;
          tipo?: Database["public"]["Enums"]["imovel_tipo"];
          cep?: string | null;
          logradouro?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          valor_aluguel?: number;
          valor_condominio?: number;
          valor_iptu?: number;
          descricao?: string | null;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["imovel_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          codigo?: string;
          tipo?: Database["public"]["Enums"]["imovel_tipo"];
          cep?: string | null;
          logradouro?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          valor_aluguel?: number;
          valor_condominio?: number;
          valor_iptu?: number;
          descricao?: string | null;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["imovel_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "imoveis_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      veiculos: {
        Row: {
          id: string;
          org_id: string;
          marca: string;
          modelo: string;
          ano: number | null;
          placa: string | null;
          renavam: string | null;
          chassi: string | null;
          cor: string | null;
          valor_aluguel: number;
          observacoes: string | null;
          status: Database["public"]["Enums"]["veiculo_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          marca: string;
          modelo: string;
          ano?: number | null;
          placa?: string | null;
          renavam?: string | null;
          chassi?: string | null;
          cor?: string | null;
          valor_aluguel?: number;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["veiculo_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          marca?: string;
          modelo?: string;
          ano?: number | null;
          placa?: string | null;
          renavam?: string | null;
          chassi?: string | null;
          cor?: string | null;
          valor_aluguel?: number;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["veiculo_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "veiculos_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      contratos: {
        Row: {
          id: string;
          org_id: string;
          numero: string | null;
          tipo: Database["public"]["Enums"]["contrato_tipo"];
          cliente_id: string;
          imovel_id: string | null;
          veiculo_id: string | null;
          valor: number;
          data_inicio: string;
          data_fim: string;
          dia_vencimento: number;
          qtd_parcelas: number;
          indice_reajuste: Database["public"]["Enums"]["indice_reajuste"];
          multa_percent: number;
          juros_mes_percent: number;
          observacoes: string | null;
          status: Database["public"]["Enums"]["contrato_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          numero?: string | null;
          tipo: Database["public"]["Enums"]["contrato_tipo"];
          cliente_id: string;
          imovel_id?: string | null;
          veiculo_id?: string | null;
          valor: number;
          data_inicio: string;
          data_fim: string;
          dia_vencimento: number;
          qtd_parcelas: number;
          indice_reajuste?: Database["public"]["Enums"]["indice_reajuste"];
          multa_percent?: number;
          juros_mes_percent?: number;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["contrato_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          numero?: string | null;
          tipo?: Database["public"]["Enums"]["contrato_tipo"];
          cliente_id?: string;
          imovel_id?: string | null;
          veiculo_id?: string | null;
          valor?: number;
          data_inicio?: string;
          data_fim?: string;
          dia_vencimento?: number;
          qtd_parcelas?: number;
          indice_reajuste?: Database["public"]["Enums"]["indice_reajuste"];
          multa_percent?: number;
          juros_mes_percent?: number;
          observacoes?: string | null;
          status?: Database["public"]["Enums"]["contrato_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_imovel_id_fkey";
            columns: ["imovel_id"];
            referencedRelation: "imoveis";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contratos_veiculo_id_fkey";
            columns: ["veiculo_id"];
            referencedRelation: "veiculos";
            referencedColumns: ["id"];
          },
        ];
      };
      parcelas: {
        Row: {
          id: string;
          org_id: string;
          contrato_id: string;
          numero: number;
          valor: number;
          vencimento: string;
          status: Database["public"]["Enums"]["parcela_status"];
          valor_pago: number | null;
          data_pagamento: string | null;
          forma_pagamento:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null;
          asaas_payment_id: string | null;
          nosso_numero: string | null;
          linha_digitavel: string | null;
          codigo_barras: string | null;
          pix_copia_cola: string | null;
          pix_qrcode: string | null;
          boleto_url: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          contrato_id: string;
          numero: number;
          valor: number;
          vencimento: string;
          status?: Database["public"]["Enums"]["parcela_status"];
          valor_pago?: number | null;
          data_pagamento?: string | null;
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null;
          asaas_payment_id?: string | null;
          nosso_numero?: string | null;
          linha_digitavel?: string | null;
          codigo_barras?: string | null;
          pix_copia_cola?: string | null;
          pix_qrcode?: string | null;
          boleto_url?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          contrato_id?: string;
          numero?: number;
          valor?: number;
          vencimento?: string;
          status?: Database["public"]["Enums"]["parcela_status"];
          valor_pago?: number | null;
          data_pagamento?: string | null;
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null;
          asaas_payment_id?: string | null;
          nosso_numero?: string | null;
          linha_digitavel?: string | null;
          codigo_barras?: string | null;
          pix_copia_cola?: string | null;
          pix_qrcode?: string | null;
          boleto_url?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parcelas_contrato_id_fkey";
            columns: ["contrato_id"];
            referencedRelation: "contratos";
            referencedColumns: ["id"];
          },
        ];
      };
      documentos: {
        Row: {
          id: string;
          org_id: string;
          entidade: Database["public"]["Enums"]["documento_entidade"];
          entidade_id: string;
          nome: string;
          storage_path: string;
          mime_type: string | null;
          tamanho_bytes: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          entidade: Database["public"]["Enums"]["documento_entidade"];
          entidade_id: string;
          nome: string;
          storage_path: string;
          mime_type?: string | null;
          tamanho_bytes?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          entidade?: Database["public"]["Enums"]["documento_entidade"];
          entidade_id?: string;
          nome?: string;
          storage_path?: string;
          mime_type?: string | null;
          tamanho_bytes?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documentos_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          id: number;
          org_id: string;
          actor_id: string | null;
          actor_email: string | null;
          acao: string;
          entidade: string | null;
          entidade_id: string | null;
          descricao: string | null;
          dados: Json | null;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          org_id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          acao: string;
          entidade?: string | null;
          entidade_id?: string | null;
          descricao?: string | null;
          dados?: Json | null;
          ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          org_id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          acao?: string;
          entidade?: string | null;
          entidade_id?: string | null;
          descricao?: string | null;
          dados?: Json | null;
          ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      mensagens: {
        Row: {
          id: string;
          org_id: string;
          canal: Database["public"]["Enums"]["mensagem_canal"];
          template: string | null;
          telefone: string;
          conteudo: string;
          cliente_id: string | null;
          contrato_id: string | null;
          parcela_id: string | null;
          status: Database["public"]["Enums"]["mensagem_status"];
          erro: string | null;
          provider_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string;
          canal?: Database["public"]["Enums"]["mensagem_canal"];
          template?: string | null;
          telefone: string;
          conteudo: string;
          cliente_id?: string | null;
          contrato_id?: string | null;
          parcela_id?: string | null;
          status?: Database["public"]["Enums"]["mensagem_status"];
          erro?: string | null;
          provider_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          canal?: Database["public"]["Enums"]["mensagem_canal"];
          template?: string | null;
          telefone?: string;
          conteudo?: string;
          cliente_id?: string | null;
          contrato_id?: string | null;
          parcela_id?: string | null;
          status?: Database["public"]["Enums"]["mensagem_status"];
          erro?: string | null;
          provider_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      configuracoes: {
        Row: {
          org_id: string;
          empresa_nome: string | null;
          empresa_documento: string | null;
          empresa_telefone: string | null;
          empresa_email: string | null;
          templates: Json;
          automacoes: Json;
          updated_at: string;
        };
        Insert: {
          org_id?: string;
          empresa_nome?: string | null;
          empresa_documento?: string | null;
          empresa_telefone?: string | null;
          empresa_email?: string | null;
          templates?: Json;
          automacoes?: Json;
          updated_at?: string;
        };
        Update: {
          org_id?: string;
          empresa_nome?: string | null;
          empresa_documento?: string | null;
          empresa_telefone?: string | null;
          empresa_email?: string | null;
          templates?: Json;
          automacoes?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      asaas_webhook_events: {
        Row: {
          id: string;
          event_id: string | null;
          event_type: string | null;
          payload: Json;
          processed: boolean;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          event_type?: string | null;
          payload: Json;
          processed?: boolean;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          event_type?: string | null;
          payload?: Json;
          processed?: boolean;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      auth_org_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      auth_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      auth_can_write: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      auth_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "admin" | "operador" | "leitura";
      pessoa_tipo: "pf" | "pj";
      cliente_status: "ativo" | "inativo" | "inadimplente";
      imovel_tipo:
        | "casa"
        | "apartamento"
        | "comercial"
        | "terreno"
        | "galpao"
        | "outro";
      imovel_status: "disponivel" | "locado" | "manutencao" | "inativo";
      veiculo_status: "disponivel" | "locado" | "manutencao" | "inativo";
      contrato_tipo: "imovel" | "veiculo";
      contrato_status: "rascunho" | "ativo" | "encerrado" | "cancelado";
      indice_reajuste: "igpm" | "ipca" | "incc" | "nenhum";
      parcela_status:
        | "pendente"
        | "pago"
        | "atrasado"
        | "cancelado"
        | "isento";
      forma_pagamento:
        | "boleto"
        | "pix"
        | "dinheiro"
        | "transferencia"
        | "cartao"
        | "outro";
      documento_entidade:
        | "cliente"
        | "imovel"
        | "veiculo"
        | "contrato"
        | "parcela";
      mensagem_status: "pendente" | "enviado" | "erro";
      mensagem_canal: "whatsapp";
    };
    CompositeTypes: Record<string, never>;
  };
};

// ---------------------------------------------------------------------------
// Helpers de conveniência (mesma API dos tipos gerados pelo Supabase)
// ---------------------------------------------------------------------------
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
