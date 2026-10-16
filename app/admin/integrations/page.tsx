'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  profileUrl?: string;
  lastSyncedAt?: string;
  syncedCount?: number;
  category: 'academic' | 'social';
  placeholder: string;
}

interface DeduplicationStats {
  totalSynced: number;
  imported: number;
  pending: number;
  byPlatform: Record<string, { total: number; imported: number }>;
}

const DEFAULT_PLATFORMS: Platform[] = [
  {
    id: 'google_scholar',
    name: 'Google Scholar',
    icon: '🎓',
    description: 'Sync publications, citations, and h-index',
    status: 'disconnected',
    category: 'academic',
    placeholder: 'https://scholar.google.com/citations?user=XXXXXXX',
  },
  {
    id: 'orcid',
    name: 'ORCID',
    icon: '🆔',
    description: 'Sync publications with DOI and career information',
    status: 'disconnected',
    category: 'academic',
    placeholder: 'https://orcid.org/0000-0000-0000-0000',
  },
  {
    id: 'researchgate',
    name: 'ResearchGate',
    icon: '🔬',
    description: 'Sync papers, projects, and Q&A',
    status: 'disconnected',
    category: 'academic',
    placeholder: 'https://www.researchgate.net/profile/Your-Name',
  },
  {
    id: 'scopus',
    name: 'Scopus',
    icon: '📊',
    description: 'Sync citation metrics and author metrics',
    status: 'disconnected',
    category: 'academic',
    placeholder: 'https://www.scopus.com/authid/detail.uri?authorId=XXXXXXX',
  },
  {
    id: 'academia',
    name: 'Academia.edu',
    icon: '🏛️',
    description: 'Sync papers and research interests',
    status: 'disconnected',
    category: 'academic',
    placeholder: 'https://sua.academia.edu/YourName',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Sync professional experience and posts',
    status: 'disconnected',
    category: 'social',
    placeholder: 'https://www.linkedin.com/in/your-name',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '💻',
    description: 'Sync code repositories and contributions',
    status: 'disconnected',
    category: 'social',
    placeholder: 'https://github.com/your-username',
  },
];

export default function IntegrationsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [deduplicationStats, setDeduplicationStats] = useState<DeduplicationStats | null>(null);

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    fetchPlatforms();
    fetchDeduplicationStats();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/integrations/status');
      const data = await response.json();
      if (data.platforms) {
        // Merge with defaults to keep placeholder values
        const merged = DEFAULT_PLATFORMS.map((def) => {
          const live = data.platforms.find((p: Platform) => p.id === def.id);
          return live ? { ...def, ...live } : def;
        });
        setPlatforms(merged);
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeduplicationStats = async () => {
    try {
      const response = await fetch('/api/import-publications');
      const data = await response.json();
      if (data.success) {
        setDeduplicationStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch deduplication stats:', error);
    }
  };

  // Open the settings modal for a platform
  const openSettings = (platform: Platform) => {
    setSelectedPlatform(platform);
    setUrlInput(platform.profileUrl || '');
    setSaveError('');
    setSaveSuccess('');
    setSettingsOpen(true);
  };

  // Save the URL
  const handleSaveUrl = async () => {
    if (!selectedPlatform) return;
    if (!urlInput.trim()) {
      setSaveError('Please enter a URL.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const response = await fetch('/api/integrations/update-url', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: selectedPlatform.id,
          profileUrl: urlInput.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(`✅ ${selectedPlatform.name} URL saved successfully!`);
        // Update local state immediately
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === selectedPlatform.id
              ? { ...p, profileUrl: urlInput.trim(), status: 'connected' }
              : p
          )
        );
        // Close modal after short delay
        setTimeout(() => setSettingsOpen(false), 1200);
      } else {
        setSaveError(`❌ ${result.error}`);
      }
    } catch (error) {
      setSaveError('❌ Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform?.profileUrl) {
      alert(`⚠️ Please add a profile URL for ${platform?.name} first.\nClick the "Settings" button on the platform card.`);
      return;
    }

    setSyncing(platformId);
    try {
      const response = await fetch(`/api/sync/${platformId}`, { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        alert(`✅ Synced ${result.count} items from ${platform.name}`);
        await fetchPlatforms();
        await fetchDeduplicationStats();
      } else {
        alert(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Sync failed: ${error}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    const connected = platforms.filter((p) => p.profileUrl);
    if (connected.length === 0) {
      alert('⚠️ No platforms have a URL set. Add URLs using the Settings button first.');
      return;
    }
    for (const platform of connected) {
      await handleSync(platform.id);
    }
  };

  const handleImportPublications = async () => {
    if (!confirm('Import synced publications to the database with automatic deduplication?')) return;

    setImporting(true);
    try {
      const response = await fetch('/api/import-publications', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        alert(
          `✅ ${result.summary}\n\nDetails:\n${result.details
            .slice(0, 5)
            .map((d: any) => `• ${d.title}: ${d.action}`)
            .join('\n')}`
        );
        await fetchDeduplicationStats();
      } else {
        alert(`❌ Import failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Import failed: ${error}`);
    } finally {
      setImporting(false);
    }
  };

  const academicPlatforms = platforms.filter((p) => p.category === 'academic');
  const socialPlatforms = platforms.filter((p) => p.category === 'social');

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Integrations</h1>
            <p className="mt-2 text-gray-600">
              Paste your profile URL for each platform, then click Sync to automatically
              import all publications.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportPublications}
              disabled={importing || syncing !== null}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <><span className="animate-spin inline-block">⟳</span> Importing...</>
              ) : (
                <><span>📥</span> Import to Database</>
              )}
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncing !== null || importing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <><span className="animate-spin inline-block">⟳</span> Syncing...</>
              ) : (
                <><span>🔄</span> Sync All</>
              )}
            </button>
          </div>
        </div>

        {/* How to use banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-blue-800">
            <strong>How to use:</strong> Click <strong>Settings</strong> on any platform card
            to paste Dr. Mbita&apos;s profile URL for that platform. Once saved, click{' '}
            <strong>Sync Now</strong> — the system will automatically download all publications
            and insert new ones into the database.
          </div>
        </div>

        {/* Deduplication Stats */}
        {deduplicationStats && deduplicationStats.totalSynced > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Deduplication Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{deduplicationStats.totalSynced}</div>
                <div className="text-sm text-gray-600 mt-1">Total Synced</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-green-600">{deduplicationStats.imported}</div>
                <div className="text-sm text-gray-600 mt-1">Already Imported</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-orange-600">{deduplicationStats.pending}</div>
                <div className="text-sm text-gray-600 mt-1">Pending Import</div>
              </div>
            </div>

            {Object.keys(deduplicationStats.byPlatform).length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">By Platform:</h4>
                <div className="space-y-2">
                  {Object.entries(deduplicationStats.byPlatform).map(([platform, stats]) => (
                    <div key={platform} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">{platform.replace('_', ' ')}</span>
                      <span className="text-gray-600">
                        {stats.imported} / {stats.total} imported
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deduplicationStats.pending > 0 && (
              <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg text-sm text-orange-800">
                💡 <strong>{deduplicationStats.pending} publications</strong> are ready to be
                imported. Click &quot;Import to Database&quot; to add them with automatic deduplication.
              </div>
            )}
          </div>
        )}

        {/* Academic Platforms */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎓 Academic Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {academicPlatforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onSync={handleSync}
                onSettings={openSettings}
                syncing={syncing === platform.id}
              />
            ))}
          </div>
        </div>

        {/* Social Platforms */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">📱 Social Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onSync={handleSync}
                onSettings={openSettings}
                syncing={syncing === platform.id}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sync Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {platforms.filter((p) => p.profileUrl).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Connected</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {platforms.reduce((sum, p) => sum + (p.syncedCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Items Synced</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{academicPlatforms.length}</div>
              <div className="text-sm text-gray-600 mt-1">Academic</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-pink-600">{socialPlatforms.length}</div>
              <div className="text-sm text-gray-600 mt-1">Social</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedPlatform.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPlatform.name} Settings</h2>
                <p className="text-sm text-gray-500">Paste the profile URL to enable syncing</p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={selectedPlatform.placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-500">
                Example: <span className="font-mono">{selectedPlatform.placeholder}</span>
              </p>
            </div>

            {/* Feedback */}
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {saveSuccess}
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              <strong>After saving:</strong> Click <em>Sync Now</em> on the platform card to
              automatically download all publications from this URL and add them to the database.
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSettingsOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUrl}
                disabled={saving || !urlInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><span className="animate-spin inline-block">⟳</span> Saving...</>
                ) : (
                  <>💾 Save URL</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function PlatformCard({
  platform,
  onSync,
  onSettings,
  syncing,
}: {
  platform: Platform;
  onSync: (id: string) => void;
  onSettings: (platform: Platform) => void;
  syncing: boolean;
}) {
  const hasUrl = !!platform.profileUrl;

  const statusColors = {
    connected: 'bg-green-100 text-green-800 border-green-300',
    disconnected: 'bg-gray-100 text-gray-600 border-gray-300',
    syncing: 'bg-blue-100 text-blue-800 border-blue-300',
    error: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusIcons = {
    connected: '✅',
    disconnected: '⭕',
    syncing: '⟳',
    error: '❌',
  };

  const displayStatus = hasUrl ? platform.status : 'disconnected';

  return (
    <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-shadow ${hasUrl ? 'border-blue-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{platform.icon}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{platform.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Status */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusColors[displayStatus]}`}
        >
          <span>{statusIcons[displayStatus]}</span>
          <span>{hasUrl ? displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1) : 'No URL set'}</span>
        </div>

        {/* Profile URL */}
        {platform.profileUrl ? (
          <div className="text-sm">
            <span className="text-gray-500">URL: </span>
            <a
              href={platform.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {platform.profileUrl.replace(/https?:\/\//, '')}
            </a>
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">No profile URL set — click Settings to add one</div>
        )}

        {/* Last Synced */}
        {platform.lastSyncedAt && (
          <div className="text-sm text-gray-500">
            Last synced: {new Date(platform.lastSyncedAt).toLocaleString()}
          </div>
        )}

        {/* Synced Count */}
        {platform.syncedCount !== undefined && platform.syncedCount > 0 && (
          <div className="text-sm text-gray-500">Items synced: {platform.syncedCount}</div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSync(platform.id)}
            disabled={syncing || !hasUrl}
            title={!hasUrl ? 'Add a URL in Settings first' : 'Sync publications from this platform'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {syncing ? '⟳ Syncing...' : '🔄 Sync Now'}
          </button>
          <button
            onClick={() => onSettings(platform)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
}
