'use client';

import { useState, useEffect } from 'react';

export default function ConnectAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [newAccount, setNewAccount] = useState({
    platform: 'google-scholar',
    accountId: '',
    apiKey: '',
  });

  const platforms = [
    { value: 'google-scholar', label: 'Google Scholar', needsApiKey: true },
    { value: 'orcid', label: 'ORCID', needsApiKey: false },
    { value: 'github', label: 'GitHub', needsApiKey: false },
    { value: 'researchgate', label: 'ResearchGate', needsApiKey: false },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/sync/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/sync/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to connect account');
        return;
      }

      alert('Account connected successfully!');
      setNewAccount({ platform: 'google-scholar', accountId: '', apiKey: '' });
      fetchAccounts();
    } catch (error) {
      alert('Failed to connect account');
    }
  };

  const handleSync = async (platform?: string) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync/now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      const data = await res.json();
      alert(data.message || 'Sync completed');
      fetchAccounts();
    } catch (error) {
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this account?')) return;

    try {
      const res = await fetch(`/api/sync/accounts?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Account disconnected');
        fetchAccounts();
      }
    } catch (error) {
      alert('Failed to disconnect account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🔗 Connect Academic Accounts
          </h1>

          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>✨ Auto-Sync Feature:</strong> Connect your academic profiles once, and all your
              publications, research, and projects will automatically sync to your website in real-time!
            </p>
          </div>

          {/* Connect New Account Form */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Connection
            </h2>
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {newAccount.platform === 'google-scholar' ? 'Scholar ID' :
                   newAccount.platform === 'orcid' ? 'ORCID ID' :
                   newAccount.platform === 'github' ? 'GitHub Username' :
                   'Account ID / Username'}
                </label>
                <input
                  type="text"
                  value={newAccount.accountId}
                  onChange={(e) => setNewAccount({ ...newAccount, accountId: e.target.value })}
                  placeholder={
                    newAccount.platform === 'google-scholar' ? 'e.g., abc123xyz' :
                    newAccount.platform === 'orcid' ? 'e.g., 0000-0001-2345-6789' :
                    newAccount.platform === 'github' ? 'e.g., username' :
                    'Enter your ID'
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {platforms.find(p => p.value === newAccount.platform)?.needsApiKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key (optional)
                  </label>
                  <input
                    type="password"
                    value={newAccount.apiKey}
                    onChange={(e) => setNewAccount({ ...newAccount, apiKey: e.target.value })}
                    placeholder="Enter API key from SerpAPI or similar service"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Get free API key from <a href="https://serpapi.com" target="_blank" rel="noopener" className="text-blue-600 dark:text-blue-400">serpapi.com</a>
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Connect Account
              </button>
            </form>
          </div>

          {/* Connected Accounts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connected Accounts
              </h2>
              <button
                onClick={() => handleSync()}
                disabled={syncing || accounts.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {syncing ? 'Syncing...' : 'Sync All Now'}
              </button>
            </div>

            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : accounts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No accounts connected yet.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {account.platform === 'google-scholar' ? '🎓' :
                           account.platform === 'orcid' ? '🆔' :
                           account.platform === 'github' ? '💻' :
                           account.platform === 'researchgate' ? '🔬' : '🔗'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {account.platform.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {account.accountId}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          account.syncStatus === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                          account.syncStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                          account.syncStatus === 'syncing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {account.syncStatus}
                        </span>
                        {account.lastSyncedAt && (
                          <span className="text-gray-500 dark:text-gray-400">
                            Last sync: {new Date(account.lastSyncedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {account.syncError && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Error: {account.syncError}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync(account.platform)}
                        disabled={syncing}
                        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Sync
                      </button>
                      <button
                        onClick={() => handleDisconnect(account.id)}
                        className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
