import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/types/database.types";

const CONFIG: Record<
  Enums<"cliente_status">,
  { label: string; className: string }
> = {
  ativo: {
    label: "Ativo",
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  inativo: {
    label: "Inativo",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  inadimplente: {
    label: "Inadimplente",
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:text-red-400",
  },
};

export function ClienteStatusBadge({
  status,
}: {
  status: Enums<"cliente_status">;
}) {
  const { label, className } = CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
