// HU11 / BR-025 / DEC-239 — combine a dictation with the score content field.
// Empty field: use the complete document returned by the STT endpoint.
// Field with ABC: keep everything, add only absent required headers (before K:)
// and append the dictated musical line. An existing M: wins over the dictated meter.
// Non-ABC content or present-but-empty required headers: dictation is refused (Q-029).
import type { DictationResult } from "./api";

const REQUIRED = ["X", "T", "M", "L", "K"] as const;
const HEADER = /^([A-Za-z]):(.*)$/;
const MAX_CONTENT = 1000;

export const dictationMessages = {
  notAbc: "El dictado solo se añade a partituras en ABC. Vacía el campo o cambia el formato a ABC.",
  emptyHeader: "Completa las cabeceras ABC vacías (X:, T:, M:, L:, K:) antes de dictar.",
  badUnit: "No se puede añadir el dictado: la cabecera L: no tiene un valor como 1/4 o 1/8.",
  tooLong: "El dictado haría que la partitura supere los 1.000 caracteres.",
};

function headerBlock(lines: string[]) {
  // Header block: leading lines that are fields (or blank) until the first musical line.
  let end = 0;
  while (end < lines.length && (HEADER.test(lines[end]) || !lines[end].trim())) end += 1;
  return end;
}

/** Reason why dictation cannot be added to the current content, checked before recording. */
export function dictationBlockReason(content: string, format: "ABC" | "TEXT"): string | null {
  if (!content.trim()) return null;
  if (format !== "ABC") return dictationMessages.notAbc;
  const lines = content.split(/\r?\n/);
  const headers = lines.slice(0, headerBlock(lines)).map((line) => HEADER.exec(line)).filter(Boolean) as RegExpExecArray[];
  if (!headers.length) return dictationMessages.notAbc;
  if (headers.some((match) => (REQUIRED as readonly string[]).includes(match[1]) && !match[2].trim())) {
    return dictationMessages.emptyHeader;
  }
  return null;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/**
 * The STT line is written for L:1/4. When the existing score uses another unit
 * (e.g. L:1/8), rewrite each duration so the dictated figures keep their value.
 * Returns null when the unit cannot be read.
 */
export function rescaleLine(line: string, unit: string | undefined): string | null {
  if (!unit || unit === "1/4") return line;
  const match = /^(\d+)\/(\d+)$/.exec(unit);
  if (!match || !Number(match[1]) || !Number(match[2])) return null;
  // value in units = quarters × (1/4) / (num/den)
  const factorNum = Number(match[2]);
  const factorDen = 4 * Number(match[1]);
  return line.replace(/([_^=]?[A-Ga-gz])(\d*)(?:\/(\d+))?/g, (_, note: string, num: string, den: string) => {
    let top = (num ? Number(num) : 1) * factorNum;
    let bottom = (den ? Number(den) : 1) * factorDen;
    const divisor = gcd(top, bottom);
    top /= divisor;
    bottom /= divisor;
    return `${note}${top === 1 ? "" : top}${bottom === 1 ? "" : `/${bottom}`}`;
  });
}

export function mergeDictation(
  content: string,
  format: "ABC" | "TEXT",
  result: DictationResult,
): { content: string } | { error: string } {
  if (!content.trim()) {
    return result.abc_document.length > MAX_CONTENT ? { error: dictationMessages.tooLong } : { content: result.abc_document };
  }
  const blocked = dictationBlockReason(content, format);
  if (blocked) return { error: blocked };

  const lines = content.replace(/\s+$/, "").split(/\r?\n/);
  const end = headerBlock(lines);
  const present = new Set(lines.slice(0, end).map((line) => HEADER.exec(line)?.[1]).filter(Boolean));
  const defaults = new Map(
    result.abc_document
      .split(/\r?\n/)
      .map((line) => HEADER.exec(line))
      .filter((match): match is RegExpExecArray => Boolean(match))
      .map((match) => [match[1], match[0]] as const),
  );
  const missing = REQUIRED.filter((field) => field !== "K" && !present.has(field)).map(
    (field) => defaults.get(field) ?? `${field}:`,
  );

  const head = lines.slice(0, end);
  const kIndex = head.findIndex((line) => line.startsWith("K:"));
  if (kIndex >= 0) head.splice(kIndex, 0, ...missing);
  else head.push(...missing, defaults.get("K") ?? "K:C");

  const unit = lines.slice(0, end).find((line) => line.startsWith("L:"))?.slice(2).trim();
  const musicLine = rescaleLine(result.abc_line, unit);
  if (musicLine === null) return { error: dictationMessages.badUnit };

  const merged = [...head, ...lines.slice(end), musicLine].join("\n");
  return merged.length > MAX_CONTENT ? { error: dictationMessages.tooLong } : { content: merged };
}
