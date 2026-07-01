import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/types/database.types";

const CONFIG: Record<
  Enums<"veiculo_status">,
  { label: string; className: string }
> = {
  disponivel: {
    label: "Disponível",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  locado: {
    label: "Locado",
    className:
      "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400",
  },
  manutencao: {
    label: "Manutenção",
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  inativo: {
    label: "Inativo",
    className: "border-transparent bg-muted text-muted-foreground",
  },
};

export function VeiculoStatusBadge({
  status,
}: {
  status: Enums<"veiculo_status">;
}) {
  const { label, className } = CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
