// lib/csv.ts
export type ParsedCSV = { headers: string[]; rows: string[][] }

function detectDelimiter(sample: string[]): string {
  const cands = [',', ';', '\t', '|']
  let best = ','
  let bestScore = -1
  for (const d of cands) {
    // score by variance of split counts across lines (prefer stable)
    const counts = sample.map((l) => l.split(d).length)
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const varc = counts.reduce((a, b) => a + (b - mean) ** 2, 0)
    const score = -varc + mean // more columns + stable
    if (score > bestScore) { bestScore = score; best = d }
  }
  return best
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = []
  let buf = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { buf += '"'; i++ } // escaped quote
      else inQ = !inQ
    } else if (ch === delim && !inQ) {
      out.push(buf); buf = ''
    } else {
      buf += ch
    }
  }
  out.push(buf)
  return out.map((s) => s.trim())
}

export function parseCSV(text: string): ParsedCSV {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (!lines.length) return { headers: [], rows: [] }

  const delim = detectDelimiter(lines.slice(0, Math.min(10, lines.length)))
  const headers = splitLine(lines[0], delim).map((h) => h.toLowerCase())
  const rows = lines.slice(1).map((l) => splitLine(l, delim))
  return { headers, rows }
}

/** Find the first existing header from a synonym list; return its index or -1. */
export function pick(headers: string[], synonyms: string[]): number {
  for (const s of synonyms) {
    const i = headers.indexOf(s)
    if (i >= 0) return i
  }
  return -1
}
