"use client";

import { useRef, useState } from "react";
import { AlertCircle, Check, Copy, Upload, X } from "lucide-react";

import { useI18n } from "@/features/inbox/i18n";
import type { AgentInstructions } from "@/features/inbox/types";

/** Copy-paste starting point shown in the guideline — headings are required. */
export const INSTRUCTION_TEMPLATE = `# Agent instructions

## About the business
What you sell, where you operate, and which channels you answer on.

## Estimated product catalog
One product per line: Name | SKU | Price | Stock | Variants.
Write NULL when you don't keep a catalog — the AI never invents prices.

## Delivery & shipping policy
Zones, timelines, charges, couriers, and tracking rules.

## Voice & tone
How replies should sound, language rules, and what to avoid.

## Exact words for sensitive answers
Refunds, delays, cancellations — literally what to say.

## Custom guardrails
Hard limits: never invent prices, never promise unapproved discounts.

## Guardrail principles
- Never invent a price that is not in the catalog
- Ask one clarifying question before guessing
- Hand off on complaints, refunds, and chargebacks`;

const GUIDELINE = [
  "Use the exact ## headings from the template — only those sections are read.",
  "Write plain text under each heading; line breaks are kept as written.",
  "Product catalog: one product per line. Leave it as NULL when you have none.",
  "Guardrail principles: one rule per bullet; each rule stays editable here.",
  ".md is the most reliable. A .pdf works when it contains selectable text.",
  "Sections missing from the file stay unchanged — only what you upload is replaced.",
];

export type ParsedInstructions = {
  instructions: Partial<AgentInstructions>;
  principles: string[];
  /** How many recognized headings were found in the file. */
  sections: number;
};

type SectionKey = keyof AgentInstructions | "principles";

const SECTION_LABELS: Array<{ key: SectionKey; labels: string[] }> = [
  { key: "about", labels: ["about the business", "about business", "business overview"] },
  {
    key: "catalog",
    labels: [
      "estimated product catalog",
      "product catalog",
      "estimated catalog",
      "catalog",
    ],
  },
  {
    key: "delivery",
    labels: [
      "delivery & shipping policy",
      "delivery and shipping policy",
      "delivery policy",
      "shipping policy",
      "delivery",
    ],
  },
  { key: "voice", labels: ["voice & tone", "voice and tone", "voice", "tone"] },
  {
    key: "exactWords",
    labels: ["exact words for sensitive answers", "exact words", "sensitive answers"],
  },
  {
    key: "custom",
    labels: ["custom guardrails", "custom guardrail", "hard limits", "constraints"],
  },
  { key: "principles", labels: ["guardrail principles", "principles", "guardrails"] },
];

function normalizeLabel(line: string): string {
  return line
    .replace(/^\s*#{1,6}\s*/, "")
    .replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/[:\s]+$/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sectionFor(line: string): SectionKey | null {
  const label = normalizeLabel(line);
  if (!label) return null;
  for (const section of SECTION_LABELS) {
    if (section.labels.includes(label)) return section.key;
  }
  return null;
}

function cleanBullet(line: string): string {
  return line
    .replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, "")
    .replace(/\*\*/g, "")
    .trim();
}

/** Map the headings in an .md/.pdf text dump onto the instruction blocks. */
export function parseInstructionText(text: string): ParsedInstructions {
  const instructions: Partial<AgentInstructions> = {};
  const principles: string[] = [];
  const preamble: string[] = [];
  let current: SectionKey | null = null;
  let buffer: string[] = [];
  let sections = 0;

  function flush() {
    if (!current) return;
    if (current === "principles") {
      principles.push(...buffer.map(cleanBullet).filter(Boolean));
    } else {
      const body = buffer.join("\n").trim();
      if (body) instructions[current] = body;
      else if (current === "catalog") instructions.catalog = "NULL";
    }
    buffer = [];
  }

  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const key = sectionFor(line);
    if (key) {
      flush();
      current = key;
      sections += 1;
      continue;
    }
    if (current) buffer.push(line);
    else if (line.trim()) preamble.push(line);
  }
  flush();

  if (sections === 0) {
    const body = preamble.join("\n").trim();
    if (body) {
      instructions.about = body;
      sections = 1;
    }
  }

  return { instructions, principles, sections };
}

/* ── PDF text extraction (no dependencies) ─────────────────────────────── */

function decodePdfString(raw: string): string {
  return raw.replace(
    /\\(n|r|t|b|f|\(|\)|\\|[0-7]{1,3})/g,
    (match, escape: string) => {
      switch (escape) {
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "b":
          return "\b";
        case "f":
          return "\f";
        case "(":
        case ")":
        case "\\":
          return escape;
        default:
          return String.fromCharCode(parseInt(escape, 8));
      }
    },
  );
}

function decodePdfHex(raw: string): string {
  const hex = raw.replace(/\s+/g, "");
  if (!hex) return "";
  const utf16 = hex.toLowerCase().startsWith("feff");
  const step = utf16 ? 4 : 2;
  let out = "";
  for (let index = 0; index + step <= hex.length; index += step) {
    const code = parseInt(hex.slice(index, index + step), 16);
    if (Number.isFinite(code)) out += String.fromCharCode(code);
  }
  return out;
}

/** Pull text-showing operators out of a PDF content stream. */
function contentStreamToText(content: string): string {
  const tokens =
    content.match(
      /\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]+>|\bT[dD*]\b|\bET\b|'/g,
    ) ?? [];
  let out = "";
  for (const token of tokens) {
    if (token.startsWith("(")) out += decodePdfString(token.slice(1, -1));
    else if (token.startsWith("<")) out += decodePdfHex(token.slice(1, -1));
    else out += "\n";
  }
  return out
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function inflateStream(
  raw: Uint8Array,
  format: "deflate" | "deflate-raw",
): Promise<string | null> {
  try {
    const stream = new Blob([raw as BlobPart])
      .stream()
      .pipeThrough(new DecompressionStream(format));
    const buffer = await new Response(stream).arrayBuffer();
    return new TextDecoder("latin1").decode(buffer);
  } catch {
    return null;
  }
}

async function pdfToText(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const latin = new TextDecoder("latin1").decode(bytes);
  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < latin.length) {
    const marker = latin.indexOf("stream", cursor);
    if (marker === -1) break;
    let start = marker + "stream".length;
    if (latin[start] === "\r") start += 1;
    if (latin[start] === "\n") start += 1;
    const end = latin.indexOf("endstream", start);
    if (end === -1) break;

    const raw = bytes.subarray(start, end);
    const inflated =
      (await inflateStream(raw, "deflate")) ??
      (await inflateStream(raw, "deflate-raw"));
    const decoded = inflated ?? new TextDecoder("latin1").decode(raw);
    if (decoded.includes("Tj") || decoded.includes("TJ")) chunks.push(decoded);
    cursor = end + "endstream".length;
  }

  const text = contentStreamToText(chunks.join("\n"));
  if ((text.match(/[A-Za-z\u0980-\u09FF]/g) ?? []).length < 20) {
    throw new Error("PDF_NO_TEXT");
  }
  return text;
}

async function readInstructionFile(file: File): Promise<string> {
  if (file.size > 2 * 1024 * 1024) throw new Error("FILE_TOO_LARGE");
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
    return pdfToText(await file.arrayBuffer());
  }
  return file.text();
}

/* ── Dialog ────────────────────────────────────────────────────────────── */

type InstructionUploadDialogProps = {
  onApply: (result: ParsedInstructions, fileName: string) => void;
  onClose: () => void;
};

export function InstructionUploadDialog({
  onApply,
  onClose,
}: InstructionUploadDialogProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(INSTRUCTION_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed — select the template text and copy it manually.");
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const text = await readInstructionFile(file);
      const parsed = parseInstructionText(text);
      if (parsed.sections === 0) throw new Error("NO_SECTIONS");
      onApply(parsed, file.name);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      if (code === "PDF_NO_TEXT") {
        setError("This PDF has no selectable text (it may be a scan). Export it as .md and upload again.");
      } else if (code === "FILE_TOO_LARGE") {
        setError("That file is over 2 MB. Trim it down or upload a .md file.");
      } else if (code === "NO_SECTIONS") {
        setError("No guideline headings were found. Check the template below and try again.");
      } else {
        setError("That file couldn't be read. Try a .md file.");
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="instruction-upload-title"
        className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="instruction-upload-title" className="text-lg font-bold">
              {t("Upload agent instructions")}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("One file can fill every block. Only the sections found in the file are replaced.")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close")}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="text-[13px] font-bold">{t("File guideline")}</h3>
            <ul className="mt-2 space-y-1.5">
              {GUIDELINE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-ink-soft">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold">{t("Template")}</h3>
              <button
                type="button"
                onClick={copyTemplate}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? t("Copied") : t("Copy template")}
              </button>
            </div>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-border bg-surface/60 p-3 text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-soft">
              {INSTRUCTION_TEMPLATE}
            </pre>
          </section>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {t(error)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3">
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,.pdf,text/markdown,application/pdf"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            <Upload className="size-4" />
            {busy ? t("Reading file…") : t("Choose .md or .pdf")}
          </button>
        </div>
      </div>
    </div>
  );
}
