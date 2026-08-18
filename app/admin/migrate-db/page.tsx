"use client";

import { useState, useEffect } from "react";

export default function MigrateDatabasePage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/migrate-citations");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Check failed:", error);
    } finally {
      setChecking(false);
    }
  };

  const runMigration = async () => {
    if (!confirm("This will add the citations column to the Publication table. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/migrate-citations", {
        method: "POST",
      });
      const data = await res.json();
      setStatus(data);
      
      if (data.success) {
        alert("✅ Migration completed successfully!");
        // Refresh the page after migration
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("❌ Migration failed: " + data.message);
      }
    } catch (error) {
      console.error("Migration failed:", error);
      alert("❌ Migration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Migration</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Citations Field Migration</h2>
        
        {checking ? (
          <div className="text-gray-600">Checking migration status...</div>
        ) : (
          <>
            {status?.citationsColumnExists ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                  <span className="text-2xl">✅</span>
                  <span>Citations Column Exists</span>
                </div>
                <p className="text-green-700">
                  The citations column is already in your database. You can now use the Complete Sync feature!
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                  <span className="text-2xl">⚠️</span>
                  <span>Citations Column Missing</span>
                </div>
                <p className="text-yellow-700 mb-4">
                  The citations column doesn't exist yet. Click the button below to add it.
                </p>
                <button
                  onClick={runMigration}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Running Migration..." : "🔧 Run Migration Now"}
                </button>
              </div>
            )}
          </>
        )}

        {status?.steps && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Migration Steps:</h3>
            <ul className="space-y-1">
              {status.steps.map((step: string, idx: number) => (
                <li key={idx} className="text-gray-700">{step}</li>
              ))}
            </ul>
          </div>
        )}

        {status?.nextSteps && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-900">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1">
              {status.nextSteps.map((step: string, idx: number) => (
                <li key={idx} className="text-blue-800">{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">About This Migration</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>What it does:</strong> Adds a <code className="bg-gray-200 px-2 py-1 rounded">citations</code> column to the Publication table to store citation counts from Google Scholar and other sources.
          </p>
          <p>
            <strong>Is it safe?</strong> Yes! The migration uses <code className="bg-gray-200 px-2 py-1 rounded">ALTER TABLE ... ADD COLUMN</code> which is a safe, non-destructive operation.
          </p>
          <p>
            <strong>What if it fails?</strong> The migration checks if the column already exists and won't cause errors. You can run it multiple times safely.
          </p>
          <p>
            <strong>After migration:</strong> Your Complete Sync feature will be able to import citation counts from all academic platforms!
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <a
          href="/admin/sync-complete"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          → Go to Complete Sync
        </a>
        <button
          onClick={checkStatus}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700"
        >
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
}
