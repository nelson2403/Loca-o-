"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export function FinanceiroFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function apply(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const status = searchParams.get("status") ?? ALL;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => apply({ status: v === ALL ? null : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Vencimento de</Label>
        <Input
          type="date"
          value={from}
          onChange={(e) => apply({ from: e.target.value || null })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Vencimento até</Label>
        <Input
          type="date"
          value={to}
          onChange={(e) => apply({ to: e.target.value || null })}
        />
      </div>
    </div>
  );
}
