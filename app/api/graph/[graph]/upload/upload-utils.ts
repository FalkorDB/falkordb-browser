export function parseCsvRows(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        currentField += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  const normalizedRows = rows.filter((row) => row.some((cell) => cell.trim() !== ""));

  if (normalizedRows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = normalizedRows;
  const headers = headerRow.map((header, index) => {
    const value = header.trim();
    return value.length > 0 ? value : `column${index + 1}`;
  });

  return dataRows.map((dataRow) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = dataRow[index] ?? "";
    });
    return record;
  });
}

export function splitCypherStatements(cypherBatch: string): string[] {
  const queries: string[] = [];
  let current = "";
  let quote: "'" | "\"" | "`" | null = null;
  let escaped = false;

  for (let i = 0; i < cypherBatch.length; i += 1) {
    const char = cypherBatch[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && quote !== "`") {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === "\"" || char === "`") {
      quote = char;
      current += char;
      continue;
    }

    if (char === ";") {
      const query = current.trim();
      if (query) queries.push(query);
      current = "";
      continue;
    }

    current += char;
  }

  const finalQuery = current.trim();
  if (finalQuery) queries.push(finalQuery);

  return queries;
}
