/** Utilitário de geração de CSV (compatível com Excel — separador ';'). */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[";\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(
  rows: Record<string, unknown>[],
  columns: { key: string; header: string }[],
): string {
  const head = columns.map((c) => escapeCell(c.header)).join(";");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(";"))
    .join("\n");
  // BOM para o Excel reconhecer UTF-8.
  return `﻿${head}\n${body}`;
}
