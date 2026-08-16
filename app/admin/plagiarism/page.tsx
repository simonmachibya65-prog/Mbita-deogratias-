"use client";

import { useState, useRef } from "react";

interface SimilarityResult {
  overallScore: number;
  level: "original" | "low" | "medium" | "high";
  metrics: {
    selfRepetition: number;
    vocabularyRichness: number;
    sentenceUniqueness: number;
    phraseOriginality: number;
  };
  repeatedPhrases: Array<{ text: string; count: number; severity: "low" | "medium" | "high" }>;
  summary: string;
  recommendations: string[];
  wordCount: number;
  sentenceCount: number;
  uniqueWordRatio: number;
}

/**
 * Comprehensive text analysis for plagiarism indicators.
 * Uses multiple metrics for a truthful assessment:
 * 1. Self-repetition: How much the text repeats itself internally
 * 2. Vocabulary richness: Type-token ratio (unique words / total words)
 * 3. Sentence uniqueness: How different each sentence is from others
 * 4. Phrase originality: N-gram diversity analysis
 */
function analyzeText(text: string): SimilarityResult {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const words = cleanText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  const wordCount = words.length;
  const sentenceCount = sentences.length;

  if (wordCount < 20) {
    return {
      overallScore: 0,
      level: "original",
      metrics: { selfRepetition: 0, vocabularyRichness: 100, sentenceUniqueness: 100, phraseOriginality: 100 },
      repeatedPhrases: [],
      summary: "Text is too short for meaningful analysis. Please provide at least 50 words.",
      recommendations: ["Provide a longer text (at least 50 words) for accurate analysis."],
      wordCount, sentenceCount, uniqueWordRatio: 1,
    };
  }

  // ── METRIC 1: Self-Repetition (n-gram analysis) ──
  // Check for repeated 4-word and 5-word phrases
  const fourGrams: Record<string, number> = {};
  const fiveGrams: Record<string, number> = {};
  const significantWords = words.filter(w => w.length > 3); // Skip short words

  for (let i = 0; i < significantWords.length - 3; i++) {
    const gram4 = significantWords.slice(i, i + 4).join(" ");
    fourGrams[gram4] = (fourGrams[gram4] ?? 0) + 1;
  }
  for (let i = 0; i < significantWords.length - 4; i++) {
    const gram5 = significantWords.slice(i, i + 5).join(" ");
    fiveGrams[gram5] = (fiveGrams[gram5] ?? 0) + 1;
  }

  const repeatedFourGrams = Object.entries(fourGrams).filter(([, c]) => c > 1);
  const repeatedFiveGrams = Object.entries(fiveGrams).filter(([, c]) => c > 1);
  const totalPhrases = Object.keys(fourGrams).length || 1;
  const selfRepetitionScore = Math.min(
    ((repeatedFourGrams.length * 2 + repeatedFiveGrams.length * 3) / totalPhrases) * 100,
    100
  );

  // ── METRIC 2: Vocabulary Richness (Type-Token Ratio) ──
  const uniqueWords = new Set(significantWords);
  const typeTokenRatio = significantWords.length > 0 ? uniqueWords.size / significantWords.length : 1;
  // TTR of 0.4+ is normal for academic text, below 0.3 suggests heavy repetition
  const vocabularyRichness = Math.min(Math.round(typeTokenRatio * 150), 100); // Normalized to 0-100

  // ── METRIC 3: Sentence Uniqueness ──
  // Compare each sentence to every other sentence using Jaccard similarity
  let totalSentenceSimilarity = 0;
  let comparisons = 0;

  for (let i = 0; i < sentences.length; i++) {
    const wordsA = new Set(sentences[i].toLowerCase().split(/\s+/).filter(w => w.length > 3));
    for (let j = i + 1; j < sentences.length; j++) {
      const wordsB = new Set(sentences[j].toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
      const union = new Set([...wordsA, ...wordsB]).size;
      if (union > 0) {
        totalSentenceSimilarity += intersection / union;
        comparisons++;
      }
    }
  }

  const avgSentenceSimilarity = comparisons > 0 ? totalSentenceSimilarity / comparisons : 0;
  // Normal academic text has ~0.1-0.2 avg similarity between sentences
  const sentenceUniqueness = Math.max(0, Math.round((1 - avgSentenceSimilarity * 2.5) * 100));

  // ── METRIC 4: Phrase Originality ──
  // Measures diversity of 3-gram patterns (structural variety)
  const threeGrams: Record<string, number> = {};
  for (let i = 0; i < words.length - 2; i++) {
    const gram = words.slice(i, i + 3).join(" ");
    threeGrams[gram] = (threeGrams[gram] ?? 0) + 1;
  }
  const uniqueThreeGrams = Object.keys(threeGrams).length;
  const totalThreeGrams = Math.max(words.length - 2, 1);
  const phraseOriginality = Math.min(Math.round((uniqueThreeGrams / totalThreeGrams) * 110), 100);

  // ── OVERALL SCORE ──
  // Weighted combination: lower score = more original
  const overallScore = Math.round(
    selfRepetitionScore * 0.35 +
    (100 - vocabularyRichness) * 0.25 +
    (100 - sentenceUniqueness) * 0.25 +
    (100 - phraseOriginality) * 0.15
  );

  const level: SimilarityResult["level"] =
    overallScore < 15 ? "original" :
    overallScore < 30 ? "low" :
    overallScore < 50 ? "medium" : "high";

  // ── REPEATED PHRASES (for display) ──
  const repeatedPhrases: SimilarityResult["repeatedPhrases"] = [];
  const allRepeated = [
    ...repeatedFiveGrams.map(([text, count]) => ({ text, count, len: 5 })),
    ...repeatedFourGrams.map(([text, count]) => ({ text, count, len: 4 })),
  ]
    .sort((a, b) => b.count - a.count || b.len - a.len)
    .slice(0, 8);

  for (const { text, count } of allRepeated) {
    const severity: "low" | "medium" | "high" = count <= 2 ? "low" : count <= 4 ? "medium" : "high";
    repeatedPhrases.push({ text, count, severity });
  }

  // ── SUMMARY & RECOMMENDATIONS ──
  let summary = "";
  const recommendations: string[] = [];

  if (level === "original") {
    summary = "The text demonstrates strong originality. Vocabulary is diverse, sentences are unique, and there is minimal internal repetition. This text shows characteristics of original writing.";
  } else if (level === "low") {
    summary = "The text shows minor repetition patterns that are common in academic writing. Overall, the content appears largely original with acceptable levels of phrase reuse.";
    if (selfRepetitionScore > 20) recommendations.push("Consider varying repeated phrases to improve readability.");
    if (vocabularyRichness < 60) recommendations.push("Try using more diverse vocabulary — synonyms can help.");
  } else if (level === "medium") {
    summary = "Moderate repetition detected. The text contains notable repeated phrases and limited vocabulary diversity. This could indicate heavy paraphrasing from a single source or formulaic writing.";
    if (selfRepetitionScore > 30) recommendations.push("Several phrases are repeated multiple times. Rewrite these sections.");
    if (vocabularyRichness < 50) recommendations.push("Vocabulary is limited. Use a thesaurus to diversify word choice.");
    if (sentenceUniqueness < 60) recommendations.push("Many sentences share similar structure. Vary your sentence patterns.");
  } else {
    summary = "High repetition and low originality indicators detected. The text has significant internal repetition, limited vocabulary, and highly similar sentence structures. This strongly suggests copied or heavily templated content.";
    recommendations.push("Rewrite sections with repeated phrases in your own words.");
    recommendations.push("Expand vocabulary — the text relies on a narrow set of words.");
    recommendations.push("Restructure sentences to show varied thinking patterns.");
    recommendations.push("Consider citing sources if content is referenced from other works.");
  }

  return {
    overallScore,
    level,
    metrics: {
      selfRepetition: Math.round(selfRepetitionScore),
      vocabularyRichness,
      sentenceUniqueness,
      phraseOriginality,
    },
    repeatedPhrases,
    summary,
    recommendations,
    wordCount,
    sentenceCount,
    uniqueWordRatio: Math.round(typeTokenRatio * 100),
  };
}

export default function PlagiarismPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setChecking(true);
    // Small delay for UX
    await new Promise(r => setTimeout(r, 800));
    setResult(analyzeText(text));
    setChecking(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a TXT, PDF, or DOCX file.");
      return;
    }

    setUploading(true);
    setUploadedFile(file.name);

    try {
      if (file.type === "text/plain") {
        const content = await file.text();
        setText(content);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/plagiarism/extract", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setText(data.text || "");
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to extract text from document.");
          setUploadedFile(null);
        }
      }
    } catch {
      alert("Failed to read the file.");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setText("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const LEVEL_CONFIG = {
    original: { bar: "bg-green-500", badge: "bg-green-100 text-green-800", label: "Original", icon: "✅" },
    low: { bar: "bg-blue-500", badge: "bg-blue-100 text-blue-800", label: "Low Concern", icon: "ℹ️" },
    medium: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-800", label: "Moderate Concern", icon: "⚠️" },
    high: { bar: "bg-red-500", badge: "bg-red-100 text-red-800", label: "High Concern", icon: "❌" },
  };

  const SEVERITY_STYLES = {
    low: "bg-blue-50 border-blue-200 text-blue-700",
    medium: "bg-amber-50 border-amber-200 text-amber-700",
    high: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Plagiarism & Originality Checker</h1>
        <p className="text-navy-500 mt-1">Upload a document or paste text for comprehensive originality analysis</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>How it works:</strong> This tool analyzes text using 4 metrics — self-repetition patterns, vocabulary richness, sentence uniqueness, and phrase originality. It detects internal plagiarism indicators without requiring an external database.
      </div>

      {/* File Upload Section */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-semibold text-navy-900 mb-3">Upload Document</h2>
        <p className="text-sm text-navy-500 mb-4">Supported formats: PDF, DOCX, TXT (max 10MB)</p>

        <div className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center hover:border-primary transition-colors">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <span className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-sm text-navy-600">Extracting text from document...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-navy-900">{uploadedFile}</p>
              <p className="text-xs text-navy-500">Text extracted — ready for analysis</p>
              <button type="button" onClick={clearFile} className="text-xs text-red-600 hover:underline mt-1">
                Remove file
              </button>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <span className="text-primary font-medium hover:underline">Click to upload</span>
                <span className="text-navy-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-navy-400">PDF, DOCX, or TXT up to 10MB</p>
            </label>
          )}
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-navy-400 font-medium">OR paste text below</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Text Input */}
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label htmlFor="check-text" className="block text-sm font-medium text-navy-800 mb-1">
            Text to Analyze
          </label>
          <textarea
            id="check-text"
            rows={10}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the text you want to check for originality..."
            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-navy-400 mt-1">{text.split(/\s+/).filter(Boolean).length} words</p>
        </div>
        <button type="submit" disabled={checking || !text.trim()}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60">
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Analyzing...
            </span>
          ) : "Analyze for Originality"}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-900 text-lg">Analysis Results</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${LEVEL_CONFIG[result.level].badge}`}>
                {LEVEL_CONFIG[result.level].icon} {LEVEL_CONFIG[result.level].label}
              </span>
            </div>

            {/* Score bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-navy-600">Similarity Concern Level</span>
                <span className="text-sm font-bold text-navy-900">{result.overallScore}%</span>
              </div>
              <div className="w-full bg-navy-100 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-700 ${LEVEL_CONFIG[result.level].bar}`}
                  style={{ width: `${Math.max(result.overallScore, 2)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-navy-400 mt-1">
                <span>0% (Highly Original)</span>
                <span>100% (Highly Repetitive)</span>
              </div>
            </div>

            {/* Document stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-navy-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-navy-900">{result.wordCount}</p>
                <p className="text-xs text-navy-500">Words</p>
              </div>
              <div className="bg-navy-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-navy-900">{result.sentenceCount}</p>
                <p className="text-xs text-navy-500">Sentences</p>
              </div>
              <div className="bg-navy-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-navy-900">{result.uniqueWordRatio}%</p>
                <p className="text-xs text-navy-500">Unique Words</p>
              </div>
            </div>

            {/* Summary */}
            <div className={`p-4 rounded-lg ${result.level === "original" ? "bg-green-50" : result.level === "low" ? "bg-blue-50" : result.level === "medium" ? "bg-amber-50" : "bg-red-50"}`}>
              <p className="text-sm">{result.summary}</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Detailed Metrics</h3>
            <div className="space-y-4">
              {[
                { label: "Self-Repetition", value: result.metrics.selfRepetition, desc: "Internal phrase repetition (lower is better)", invert: true },
                { label: "Vocabulary Richness", value: result.metrics.vocabularyRichness, desc: "Diversity of word usage (higher is better)", invert: false },
                { label: "Sentence Uniqueness", value: result.metrics.sentenceUniqueness, desc: "How different sentences are from each other (higher is better)", invert: false },
                { label: "Phrase Originality", value: result.metrics.phraseOriginality, desc: "Diversity of phrase patterns (higher is better)", invert: false },
              ].map(metric => {
                const isGood = metric.invert ? metric.value < 30 : metric.value > 60;
                const isBad = metric.invert ? metric.value > 50 : metric.value < 40;
                const barColor = isGood ? "bg-green-500" : isBad ? "bg-red-500" : "bg-amber-500";
                return (
                  <div key={metric.label}>
                    <div className="flex justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-navy-800">{metric.label}</span>
                        <p className="text-xs text-navy-400">{metric.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-navy-900">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(metric.value, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repeated Phrases */}
          {result.repeatedPhrases.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-semibold text-navy-900 mb-4">Repeated Phrases Detected</h3>
              <div className="space-y-2">
                {result.repeatedPhrases.map((phrase, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${SEVERITY_STYLES[phrase.severity]}`}>
                    <span className="text-sm font-mono">&ldquo;{phrase.text}&rdquo;</span>
                    <span className="text-xs font-semibold whitespace-nowrap ml-3">
                      ×{phrase.count} occurrences
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-semibold text-navy-900 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                    <span className="text-primary mt-0.5">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
