import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/types/database.types";

const CONFIG: Record<
  Enums<"parcela_status">,
  { label: string; className: string }
> = {
  pendente: {
    label: "Pendente",
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  pago: {
    label: "Pago",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  atrasado: {
    label: "Atrasado",
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:text-red-400",
  },
  cancelado: {
    label: "Cancelado",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  isento: {
    label: "Isento",
    className:
      "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400",
  },
};

export function ParcelaStatusBadge({
  status,
}: {
  status: Enums<"parcela_status">;
}) {
  const { label, className } = CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
