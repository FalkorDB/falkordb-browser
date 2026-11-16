export function csvCell(value: string): string {
  const safeValue = /^[\s\u0000-\u001F\uFEFF]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}
