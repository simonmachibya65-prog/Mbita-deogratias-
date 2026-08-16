/**
 * Client-side hook for real-time auto-sync
 * Fetches latest content when component mounts
 */

'use client';

import { useEffect, useState } from 'react';

interface SyncStatus {
  isLoading: boolean;
  lastSync: Date | null;
  error: string | null;
}

export function useAutoSync(enabled: boolean = true) {
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    lastSync: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    const syncNow = async () => {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/sync/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Sync failed');
        }

        const data = await response.json();

        setStatus({
          isLoading: false,
          lastSync: new Date(),
          error: null,
        });

        console.log('[AutoSync] Synced:', data);
      } catch (error: any) {
        setStatus({
          isLoading: false,
          lastSync: null,
          error: error.message,
        });

        console.error('[AutoSync] Error:', error);
      }
    };

    // Sync on mount
    syncNow();

    // Optional: Sync periodically (every 30 seconds)
    const interval = setInterval(syncNow, 30000);

    return () => clearInterval(interval);
  }, [enabled]);

  return status;
}

// Hook to fetch synced content
export function useSyncedContent(platform?: string, contentType?: string) {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const params = new URLSearchParams();
        if (platform) params.set('platform', platform);
        if (contentType) params.set('type', contentType);

        const response = await fetch(`/api/sync/content?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        setContent(data.content || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [platform, contentType]);

  return { content, loading, error };
}
