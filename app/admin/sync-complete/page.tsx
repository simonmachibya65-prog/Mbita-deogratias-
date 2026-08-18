"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function CompleteSyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleCompleteSync() {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/sync-academic-complete", {
        method: "POST"
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to sync",
        errors: [(error as Error).message]
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Complete Profile Sync</h2>
        <p className="text-gray-600 mt-1">
          Fetch ALL content from your academic profiles automatically
        </p>
      </div>

      {/* Main Action */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-8 mb-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">
            One-Click Complete Sync
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Automatically import <strong>everything</strong> from your academic profiles:
            Publications, Profile Info, Co-authors, Research Interests, Photos, and more!
          </p>
          
          <Button
            onClick={handleCompleteSync}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg px-8 py-4 shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin">⏳</span>
                <span>Syncing Everything...</span>
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span>⚡</span>
                <span>Sync Everything Now</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* What Gets Synced */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">📦 What Gets Imported:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-green-500 pl-4">
            <div className="font-semibold text-navy-900 flex items-center gap-2 mb-2">
              <span>📚</span>
              <span>Publications</span>
            </div>
            <p className="text-sm text-gray-600">All your research papers with titles, years, venues, and citation counts</p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <div className="font-semibold text-navy-900 flex items-center gap-2 mb-2">
              <span>👤</span>
              <span>Profile Information</span>
            </div>
            <p className="text-sm text-gray-600">Name, affiliation, bio, and profile statistics (h-index, citations)</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <div className="font-semibold text-navy-900 flex items-center gap-2 mb-2">
              <span>👥</span>
              <span>Co-authors</span>
            </div>
            <p className="text-sm text-gray-600">Automatically added to your Collaborators section</p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <div className="font-semibold text-navy-900 flex items-center gap-2 mb-2">
              <span>🔬</span>
              <span>Research Interests</span>
            </div>
            <p className="text-sm text-gray-600">Your research areas and topics of expertise</p>
          </div>

          <div className="border-l-4 border-pink-500 pl-4">
            <div className="font-semibold text-navy-900 flex items-center gap-2 mb-2">
              <span>🖼️</span>
              <span>Profile Photo</span>
            </div>
            <p className="text-sm text-gray-600">Added to your gallery automatically</p>
          </div>

          <div className="border-l-4 border-indigo-500 pl-4">
            <div className="font-semibold text-navy-900 flex items-center gap-2 mb-2">
              <span>📊</span>
              <span>Statistics</span>
            </div>
            <p className="text-sm text-gray-600">Citation metrics, h-index, i10-index from Google Scholar</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`border-2 rounded-lg p-6 shadow-lg ${
          result.success 
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400" 
            : "bg-gradient-to-br from-red-50 to-rose-50 border-red-400"
        }`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            {result.success ? (
              <>
                <span className="text-3xl">🎉</span>
                <span className="text-green-800">Sync Complete!</span>
              </>
            ) : (
              <>
                <span className="text-3xl">❌</span>
                <span className="text-red-800">Sync Failed</span>
              </>
            )}
          </h3>
          
          {result.message && (
            <div className={`mb-4 p-4 rounded-lg ${
              result.success ? "bg-white border border-green-200" : "bg-white border border-red-200"
            }`}>
              <p className="text-navy-800 font-semibold">{result.message}</p>
            </div>
          )}

          {result.success && result.imported && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{result.imported.publications}</div>
                <div className="text-sm text-gray-600 mt-1">📚 Publications</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow-sm">
                <div className="text-3xl font-bold text-purple-600">{result.imported.collaborators}</div>
                <div className="text-sm text-gray-600 mt-1">👥 Collaborators</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500 shadow-sm">
                <div className="text-3xl font-bold text-pink-600">{result.imported.galleryItems}</div>
                <div className="text-sm text-gray-600 mt-1">🖼️ Gallery Items</div>
              </div>
            </div>
          )}

          {result.debugInfo && result.debugInfo.length > 0 && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <strong className="text-gray-900">🔍 Debug Info:</strong>
              <ul className="list-disc list-inside text-xs text-gray-700 font-mono mt-2 space-y-1">
                {result.debugInfo.map((info: string, idx: number) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <strong className="text-red-900">❌ Errors:</strong>
              <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                {result.errors.map((err: string, idx: number) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {result.success && (
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => window.location.href = "/admin/publications"}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                📄 View Publications
              </Button>
              <Button
                onClick={() => window.location.href = "/admin/collaborations"}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                👥 View Collaborators
              </Button>
              <Button
                onClick={() => window.location.href = "/admin/gallery"}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
              >
                🖼️ View Gallery
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-3">ℹ️ How It Works</h3>
        
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>1. Reads your academic profile links</strong> from Profile Settings → Academic Links
          </p>
          <p>
            <strong>2. Fetches ALL available data</strong> from Google Scholar, ORCID, and other sources
          </p>
          <p>
            <strong>3. Automatically organizes content</strong> into the right sections (Publications, Collaborators, Gallery)
          </p>
          <p>
            <strong>4. Removes duplicates</strong> so you don't get the same content twice
          </p>
          <p>
            <strong>5. Updates your website</strong> with all the imported content immediately
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Run this sync periodically to keep your website up-to-date with your latest publications and collaborations!
          </p>
        </div>
      </div>
    </div>
  );
}
