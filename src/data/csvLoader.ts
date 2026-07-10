import Papa from "papaparse";
import { MONTH_NAMES, type ChartRow, type MonthName } from "../types";

const MONTH_LOOKUP = new Map<string, MonthName>(
  MONTH_NAMES.map((m) => [m.toLowerCase(), m])
);

function normalizeMonth(raw: string): MonthName | null {
  return MONTH_LOOKUP.get(raw.trim().toLowerCase()) ?? null;
}

interface RawRow {
  year?: string;
  month?: string;
  title?: string;
  performer?: string;
  [key: string]: string | undefined;
}

/** Fetches and parses the chart CSV into rows the question generator can use. */
export async function loadChartRows(url: string): Promise<ChartRow[]> {
  const csvText = await fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to load CSV at ${url}: ${res.status}`);
    return res.text();
  });

  const parsed = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const rows: ChartRow[] = [];
  for (const raw of parsed.data) {
    const year = Number.parseInt((raw.year ?? "").trim(), 10);
    const month = normalizeMonth(raw.month ?? "");
    const title = (raw.title ?? "").trim();
    const performer = (raw.performer ?? "").trim();

    if (!Number.isFinite(year) || !month || !title || !performer) continue;

    rows.push({ year, month, title, performer });
  }

  return rows;
}
