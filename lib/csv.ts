export type CsvKanjiRow = {
  kanji: string;
  reading: string;
  meaning: string;
  level?: string;
  category?: string;
};

export function parseCsv(text: string): CsvKanjiRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("kanji") ||
    header.includes("cara_baca") ||
    header.includes("reading");

  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line): CsvKanjiRow | null => {
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length < 3) {
        return null;
      }

      return {
        kanji: parts[0],
        reading: parts[1],
        meaning: parts[2],
        level: parts[3] || undefined,
        category: parts[4] || undefined,
      };
    })
    .filter((row): row is CsvKanjiRow => row !== null && row.kanji.length > 0);
}

export function kanjisToCsv(
  rows: Array<{
    kanji: string;
    reading: string;
    meaning: string;
    category?: string | null;
  }>,
): string {
  const header = "kanji,cara_baca,arti,level,kelompok";
  const body = rows
    .map((row) =>
      [
        row.kanji,
        row.reading,
        row.meaning,
        "",
        row.category ?? "",
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  return `${header}\n${body}`;
}

export function kanjisToJson(
  rows: Array<{
    kanji: string;
    reading: string;
    meaning: string;
    category?: string | null;
    example?: string | null;
  }>,
): string {
  return JSON.stringify(rows, null, 2);
}
