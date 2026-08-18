"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface SyncResult {
  success: boolean;
  totalFound?: number;
  imported?: number;
  skipped?: number;
  publicationsFound?: number;
  publications?: any[];
  sources?: string[];
  errors?: string[];
  message?: string;
}

export default function SyncPage() {
  const [isPreviewingSync, setPreviewingSync] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewResult, setPreviewResult] = useState<SyncResult | null>(null);
  const [importResult, setImportResult] = useState<SyncResult | null>(null);

  async function handlePreview() {
    setPreviewingSync(true);
    setPreviewResult(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/sync-academic");
      const data = await res.json();
      setPreviewResult(data);
    } catch (error) {
      setPreviewResult({
        success: false,
        message: "Failed to fetch publications",
        errors: [(error as Error).message]
      });
    } finally {
      setPreviewingSync(false);
    }
  }

  async function handleImport() {
    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/sync-academic", {
        method: "POST"
      });
      const data = await res.json();
      setImportResult(data);
      setPreviewResult(null); // Clear preview after import
    } catch (error) {
      setImportResult({
        success: false,
        message: "Failed to import publications",
        errors: [(error as Error).message]
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Academic Profile Sync</h2>
        <p className="text-gray-600 mt-1">
          Automatically fetch publications from your academic profiles
        </p>
      </div>

      {/* Sync Controls */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Auto-Sync Publications</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-navy-900 mb-2">📚 Supported Sources</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>ORCID</strong> - Most reliable (requires ORCID ID in profile)</li>
              <li>• <strong>Semantic Scholar</strong> - Free API, good coverage</li>
              <li>• <strong>Google Scholar</strong> - Via web scraping (may be limited)</li>
              <li>• <strong>CrossRef</strong> - DOI-based lookup</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              disabled={isPreviewingSync}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPreviewingSync ? "Fetching..." : "🔍 Preview Publications"}
            </Button>

            <Button
              onClick={handleImport}
              disabled={isImporting || isPreviewingSync}
              className="bg-green-600 hover:bg-green-700"
            >
              {isImporting ? "Importing..." : "⬇️ Fetch & Import Now"}
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            <strong>Preview</strong> shows what will be imported without saving. 
            <strong> Import</strong> fetches and saves publications to your database.
          </p>
        </div>
      </div>

      {/* Preview Results */}
      {previewResult && (
        <div className={`border rounded-lg p-6 mb-6 ${
          previewResult.success ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"
        }`}>
          <h3 className="text-lg font-semibold mb-3">
            {previewResult.success ? "✅ Preview Results" : "⚠️ Sync Issues"}
          </h3>
          
          {previewResult.message && (
            <p className="mb-4 text-navy-700">{previewResult.message}</p>
          )}

          {previewResult.sources && previewResult.sources.length > 0 && (
            <div className="mb-4">
              <strong>Sources:</strong> {previewResult.sources.join(", ")}
            </div>
          )}

          {previewResult.errors && previewResult.errors.length > 0 && (
            <div className="mb-4">
              <strong>Errors:</strong>
              <ul className="list-disc list-inside text-sm mt-2">
                {previewResult.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {previewResult.publications && previewResult.publications.length > 0 && (
            <div>
              <strong className="block mb-2">
                Found {previewResult.publications.length} Publications:
              </strong>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {previewResult.publications.map((pub, idx) => (
                  <div key={idx} className="bg-white border border-border rounded p-3 text-sm">
                    <div className="font-medium text-navy-900">{pub.title}</div>
                    <div className="text-gray-600 text-xs mt-1">
                      {pub.authors?.join(", ") || "Unknown authors"} • {pub.venue} • {pub.year}
                    </div>
                    {pub.citations !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        📊 {pub.citations} citations
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                {isImporting ? "Importing..." : "⬇️ Import These Publications"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className={`border rounded-lg p-6 ${
          importResult.success ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
        }`}>
          <h3 className="text-lg font-semibold mb-3">
            {importResult.success ? "✅ Import Complete" : "❌ Import Failed"}
          </h3>
          
          {importResult.message && (
            <p className="mb-4 text-navy-700 font-medium">{importResult.message}</p>
          )}

          {importResult.success && (
            <div className="space-y-2">
              <div>📚 <strong>Total Found:</strong> {importResult.totalFound}</div>
              <div>✅ <strong>Imported:</strong> {importResult.imported} new publications</div>
              <div>⏭️ <strong>Skipped:</strong> {importResult.skipped} (already exist)</div>
              {importResult.sources && (
                <div>🔗 <strong>Sources:</strong> {importResult.sources.join(", ")}</div>
              )}
            </div>
          )}

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-4">
              <strong>Errors:</strong>
              <ul className="list-disc list-inside text-sm mt-2">
                {importResult.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.success && (
            <div className="mt-4">
              <Button
                onClick={() => window.location.href = "/admin/publications"}
                className="bg-navy-600 hover:bg-navy-700"
              >
                📄 View Publications
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-gray-50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-3">⚙️ Setup Instructions</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-navy-900 mb-1">1. Add Your ORCID ID</h4>
            <p className="text-gray-600">
              Go to <strong>Profile Settings</strong> and add your ORCID ID (e.g., 0000-0002-1825-0097). 
              This is the most reliable source.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-navy-900 mb-1">2. Add Google Scholar Profile</h4>
            <p className="text-gray-600">
              In <strong>Profile Settings</strong>, add your Google Scholar URL under Academic Profiles.
              Format: https://scholar.google.com/citations?user=YOUR_ID
            </p>
          </div>

          <div>
            <h4 className="font-medium text-navy-900 mb-1">3. Run Sync</h4>
            <p className="text-gray-600">
              Click <strong>Preview</strong> to see what will be imported, then <strong>Import</strong> to save to database.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <strong className="text-amber-900">⚠️ Note:</strong>
            <p className="text-amber-800 text-xs mt-1">
              Google Scholar scraping may be rate-limited. ORCID and Semantic Scholar are more reliable.
              Duplicates are automatically detected and skipped.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
