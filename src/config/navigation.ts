import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Car,
  FileText,
  Wallet,
  MessageSquare,
  Zap,
  History,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Marca funcionalidades ainda não implementadas (mostra badge "em breve"). */
  disabled?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Estrutura de navegação principal do app. Fonte única para renderizar a
 * sidebar. Adicionar um módulo novo = adicionar um item aqui.
 */
export const navigation: NavGroup[] = [
  {
    label: "Geral",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Clientes", href: "/clientes", icon: Users },
      { title: "Imóveis", href: "/imoveis", icon: Building2 },
      { title: "Veículos", href: "/veiculos", icon: Car },
    ],
  },
  {
    label: "Operação",
    items: [
      { title: "Contratos", href: "/contratos", icon: FileText },
      { title: "Financeiro", href: "/financeiro", icon: Wallet },
      {
        title: "Mensagens",
        href: "/mensagens",
        icon: MessageSquare,
      },
      { title: "Automações", href: "/automacoes", icon: Zap },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Histórico", href: "/historico", icon: History },
      {
        title: "Configurações",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];
