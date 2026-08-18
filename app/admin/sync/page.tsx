"use client";

import { useState, useEffect } from "react";
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
  debugInfo?: string[];
}

interface Profile {
  fullName: string;
  academicProfiles: { label: string; url: string }[];
}

export default function SyncPage() {
  const [isPreviewingSync, setPreviewingSync] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewResult, setPreviewResult] = useState<SyncResult | null>(null);
  const [importResult, setImportResult] = useState<SyncResult | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            fullName: data.fullName,
            academicProfiles: Array.isArray(data.academicProfiles) ? data.academicProfiles : []
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

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
        <h3 className="text-lg font-semibold text-navy-800 mb-4">🔄 Auto-Sync Publications</h3>
        
        {/* Current Academic Profile Links */}
        {!loadingProfile && profile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <span>👤</span>
              <span>Your Academic Profile</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Name:</span>
                <span className="text-navy-800 font-semibold">{profile.fullName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Academic Links ({profile.academicProfiles.length}):</span>
                {profile.academicProfiles.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {profile.academicProfiles.map((link, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-green-600">✓</span>
                        <span className="font-medium">{link.label}:</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-amber-800 text-xs">
                      ⚠️ No academic profile links configured. Add them in{" "}
                      <a href="/admin/profile" className="font-semibold underline">Profile Settings → Academic Links</a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <span>📚</span>
              <span>How Auto-Sync Works</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <span className="font-bold text-blue-600 min-w-[24px]">1.</span>
                <span>System reads your <strong>Academic Profile Links</strong> from Profile Settings</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-blue-600 min-w-[24px]">2.</span>
                <span>Automatically fetches publications from <strong>ORCID, Semantic Scholar, CrossRef</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-blue-600 min-w-[24px]">3.</span>
                <span>Removes duplicates and sorts by year</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-blue-600 min-w-[24px]">4.</span>
                <span>Saves to your Publications database</span>
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <span>⚡</span>
              <span>Supported Sources (Priority Order)</span>
            </h4>
            <ul className="text-sm text-amber-800 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>ORCID</strong> - Most reliable, requires ORCID ID in profile
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Semantic Scholar</strong> - Free API, good coverage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <strong>CrossRef</strong> - DOI-based lookup, academic journals
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              disabled={isPreviewingSync}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <span>{isPreviewingSync ? "⏳" : "🔍"}</span>
              <span>{isPreviewingSync ? "Fetching..." : "Preview Publications"}</span>
            </Button>

            <Button
              onClick={handleImport}
              disabled={isImporting || isPreviewingSync}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <span>{isImporting ? "⏳" : "⬇️"}</span>
              <span>{isImporting ? "Importing..." : "Fetch & Import Now"}</span>
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong className="text-navy-900">💡 Tip:</strong> Click <strong>Preview</strong> to see what will be imported without saving. 
              Click <strong>Import</strong> to fetch and save publications to your database. Duplicates are automatically skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Results */}
      {previewResult && (
        <div className={`border-2 rounded-lg p-6 mb-6 shadow-md ${
          previewResult.success 
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400" 
            : "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400"
        }`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            {previewResult.success ? (
              <>
                <span className="text-2xl">✅</span>
                <span className="text-green-800">Preview Results</span>
              </>
            ) : (
              <>
                <span className="text-2xl">⚠️</span>
                <span className="text-amber-800">Sync Issues Detected</span>
              </>
            )}
          </h3>
          
          {previewResult.message && (
            <div className={`mb-4 p-4 rounded-lg ${
              previewResult.success ? "bg-white border border-green-200" : "bg-white border border-amber-200"
            }`}>
              <p className="text-navy-800 font-medium">{previewResult.message}</p>
            </div>
          )}

          {previewResult.sources && previewResult.sources.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
              <strong className="text-navy-900 flex items-center gap-2 mb-2">
                <span>🔗</span>
                <span>Data Sources:</span>
              </strong>
              <div className="flex gap-2 flex-wrap">
                {previewResult.sources.map((source, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {previewResult.errors && previewResult.errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
              <strong className="text-red-900 flex items-center gap-2 mb-2">
                <span>❌</span>
                <span>Errors:</span>
              </strong>
              <ul className="list-disc list-inside text-sm space-y-1">
                {previewResult.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {previewResult.debugInfo && previewResult.debugInfo.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <strong className="text-gray-900 flex items-center gap-2 mb-2">
                <span>🔍</span>
                <span>Debug Information:</span>
              </strong>
              <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 font-mono">
                {previewResult.debugInfo.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {previewResult.publications && previewResult.publications.length > 0 && (
            <div>
              <div className="bg-white rounded-lg border border-green-300 p-4 mb-4">
                <strong className="text-lg text-green-800 flex items-center gap-2">
                  <span>📚</span>
                  <span>Found {previewResult.publications.length} Publications</span>
                </strong>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto space-y-3 mb-4 pr-2">
                {previewResult.publications.map((pub, idx) => (
                  <div key={idx} className="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm hover:shadow-md transition-shadow p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-navy-900 mb-2 leading-tight">{pub.title}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">👥 Authors:</span>
                            <span>{pub.authors?.join(", ") || "Unknown authors"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">📖 Venue:</span>
                            <span>{pub.venue}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">📅</span>
                              <span>{pub.year}</span>
                            </div>
                            {pub.citations !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">📊</span>
                                <span>{pub.citations} citations</span>
                              </div>
                            )}
                            <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                              {pub.source}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-3xl text-gray-300">
                        {idx + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg"
              >
                {isImporting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>Importing Publications...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>⬇️</span>
                    <span>Import All {previewResult.publications.length} Publications</span>
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className={`border-2 rounded-lg p-6 mb-6 shadow-lg ${
          importResult.success 
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400" 
            : "bg-gradient-to-br from-red-50 to-rose-50 border-red-400"
        }`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            {importResult.success ? (
              <>
                <span className="text-3xl">🎉</span>
                <span className="text-green-800">Import Successful!</span>
              </>
            ) : (
              <>
                <span className="text-3xl">❌</span>
                <span className="text-red-800">Import Failed</span>
              </>
            )}
          </h3>
          
          {importResult.message && (
            <div className={`mb-4 p-4 rounded-lg ${
              importResult.success ? "bg-white border border-green-200" : "bg-white border border-red-200"
            }`}>
              <p className="text-navy-800 font-semibold text-lg">{importResult.message}</p>
            </div>
          )}

          {importResult.success && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{importResult.totalFound}</div>
                <div className="text-sm text-gray-600 mt-1">📚 Total Found</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
                <div className="text-3xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-gray-600 mt-1">✅ Imported</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-gray-400 shadow-sm">
                <div className="text-3xl font-bold text-gray-600">{importResult.skipped}</div>
                <div className="text-sm text-gray-600 mt-1">⏭️ Skipped (exist)</div>
              </div>
            </div>
          )}

          {importResult.sources && importResult.sources.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-indigo-200">
              <strong className="text-navy-900 flex items-center gap-2 mb-2">
                <span>🔗</span>
                <span>Sources Used:</span>
              </strong>
              <div className="flex gap-2 flex-wrap">
                {importResult.sources.map((source, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
              <strong className="text-red-900 flex items-center gap-2 mb-2">
                <span>❌</span>
                <span>Errors:</span>
              </strong>
              <ul className="list-disc list-inside text-sm space-y-1">
                {importResult.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.success && (
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = "/admin/publications"}
                className="flex-1 bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>📄</span>
                  <span>View All Publications</span>
                </span>
              </Button>
              <Button
                onClick={() => {
                  setImportResult(null);
                  handlePreview();
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🔄</span>
                  <span>Sync Again</span>
                </span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4 flex items-center gap-2">
          <span>⚙️</span>
          <span>Setup Guide</span>
        </h3>
        
        <div className="space-y-5 text-sm">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
              <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              <span>Add Your ORCID ID (Recommended)</span>
            </h4>
            <p className="text-gray-600 mb-2">
              ORCID provides the most reliable and complete publication data. Get your ORCID ID from{" "}
              <a href="https://orcid.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                orcid.org
              </a>
            </p>
            <div className="bg-gray-50 rounded p-3 mt-2">
              <p className="text-xs text-gray-500 mb-1">Example format:</p>
              <code className="text-xs bg-white px-2 py-1 rounded border">0000-0002-1825-0097</code>
              <p className="text-xs text-gray-500 mt-2">
                Go to <strong>Profile Settings → Academic Links</strong> and add your ORCID profile URL
              </p>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              <span>Alternative: Use Your Author Name</span>
            </h4>
            <p className="text-gray-600 mb-2">
              If you don't have ORCID, the system will search <strong>Semantic Scholar</strong> and <strong>CrossRef</strong> using your full name from profile.
            </p>
            <div className="bg-gray-50 rounded p-3 mt-2">
              <p className="text-xs text-gray-500">
                ✅ Make sure your <strong>Full Name</strong> in Profile Settings matches your published name exactly
              </p>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              <span>Run Auto-Sync</span>
            </h4>
            <div className="space-y-2 text-gray-600">
              <p>• Click <strong className="text-blue-600">Preview</strong> to see publications before importing</p>
              <p>• Review the list to ensure accuracy</p>
              <p>• Click <strong className="text-green-600">Import</strong> to save to database</p>
              <p>• View imported publications in <strong>Publications</strong> section</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Important Notes</span>
            </h4>
            <ul className="text-xs text-red-800 space-y-1.5">
              <li>• Auto-sync may not find all publications if your name varies across sources</li>
              <li>• ORCID gives best results - highly recommended</li>
              <li>• Duplicate detection is automatic - safe to run multiple times</li>
              <li>• Manual publication entry is always available as backup</li>
              <li>• CrossRef searches may be slower but have good academic coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
