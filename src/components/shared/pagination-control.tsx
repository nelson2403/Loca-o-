"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationControlProps {
  page: number;
  totalPages: number;
  totalCount: number;
}

/** Paginação simples baseada no parâmetro `page` da URL. */
export function PaginationControl({
  page,
  totalPages,
  totalCount,
}: PaginationControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        {totalCount} {totalCount === 1 ? "registro" : "registros"} · página{" "}
        {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
        >
          Próxima
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
