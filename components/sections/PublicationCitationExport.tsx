"use client";

import { useState } from "react";

interface Publication {
  id: string;
  title: string;
  authors: unknown;
  venue: string;
  year: number;
  type: string;
  doi?: string | null;
}

interface Props {
  publication: Publication;
}

function getAuthors(authors: unknown): string[] {
  if (Array.isArray(authors)) return authors as string[];
  return [];
}

function toBibTeX(pub: Publication): string {
  const authors = getAuthors(pub.authors).join(" and ");
  const key = `${getAuthors(pub.authors)[0]?.split(" ").pop() ?? "Author"}${pub.year}`;
  const type = pub.type === "journal" ? "article" : pub.type === "book" ? "book" : "inproceedings";
  return `@${type}{${key},
  title     = {${pub.title}},
  author    = {${authors}},
  year      = {${pub.year}},
  journal   = {${pub.venue}},${pub.doi ? `\n  doi       = {${pub.doi}},` : ""}
}`;
}

function toAPA(pub: Publication): string {
  const authors = getAuthors(pub.authors);
  const authorStr = authors.length > 1
    ? authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1]
    : authors[0] ?? "Author";
  return `${authorStr} (${pub.year}). ${pub.title}. *${pub.venue}*.${pub.doi ? ` https://doi.org/${pub.doi}` : ""}`;
}

function toIEEE(pub: Publication): string {
  const authors = getAuthors(pub.authors);
  const authorStr = authors.map((a) => {
    const parts = a.split(" ");
    const last = parts.pop() ?? "";
    const initials = parts.map((p) => p[0] + ".").join(" ");
    return `${initials} ${last}`.trim();
  }).join(", ");
  return `${authorStr}, "${pub.title}," ${pub.venue}, ${pub.year}.${pub.doi ? ` doi: ${pub.doi}.` : ""}`;
}

export default function PublicationCitationExport({ publication }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"bibtex" | "apa" | "ieee">("bibtex");
  const [copied, setCopied] = useState(false);

  const citation =
    format === "bibtex" ? toBibTeX(publication)
    : format === "apa" ? toAPA(publication)
    : toIEEE(publication);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === "bibtex" ? "bib" : "txt";
    const blob = new Blob([citation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citation-${publication.id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-navy-500 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-2 py-1 border border-border hover:border-primary"
        aria-expanded={open}
        aria-label="Export citation"
      >
        Cite
      </button>

      {open && (
        <div className="absolute z-20 bottom-full mb-2 left-0 w-80 bg-white border border-border rounded-xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-navy-900">Export Citation</span>
            <button onClick={() => setOpen(false)} className="text-navy-400 hover:text-navy-700" aria-label="Close">✕</button>
          </div>

          {/* Format selector */}
          <div className="flex gap-1 mb-3">
            {(["bibtex", "apa", "ieee"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${format === f ? "bg-primary text-white" : "bg-navy-50 text-navy-700 hover:bg-navy-100"}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Citation text */}
          <pre className="text-xs bg-navy-50 rounded-lg p-3 overflow-auto max-h-32 whitespace-pre-wrap text-navy-700 mb-3 font-mono">
            {citation}
          </pre>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-1.5 text-xs border border-border text-navy-700 rounded-md hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
