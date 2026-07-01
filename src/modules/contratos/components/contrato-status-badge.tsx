import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/types/database.types";

const CONFIG: Record<
  Enums<"contrato_status">,
  { label: string; className: string }
> = {
  rascunho: {
    label: "Rascunho",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  ativo: {
    label: "Ativo",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  encerrado: {
    label: "Encerrado",
    className:
      "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400",
  },
  cancelado: {
    label: "Cancelado",
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:text-red-400",
  },
};

export function ContratoStatusBadge({
  status,
}: {
  status: Enums<"contrato_status">;
}) {
  const { label, className } = CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
