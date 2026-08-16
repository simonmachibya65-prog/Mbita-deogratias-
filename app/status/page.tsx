'use client';

import { useState, useEffect } from 'react';

export default function StatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus({
        success: response.ok,
        ...data,
      });
    } catch (error: any) {
      setStatus({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-6">
            System Status
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Checking system status...</p>
            </div>
          ) : (
            <div>
              <div className={`p-6 rounded-lg mb-6 ${status?.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
                <h2 className="text-2xl font-bold mb-2">
                  {status?.success ? '✅ System Online' : '❌ System Error'}
                </h2>
                <p className="text-lg">
                  {status?.success 
                    ? 'Database connected successfully!' 
                    : 'Database connection failed'}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Diagnostic Information:</h3>
                <pre className="bg-white p-4 rounded border overflow-auto text-sm">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  onClick={testConnection}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  🔄 Test Again
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="/login"
                    className="text-center bg-navy-900 text-white py-3 px-6 rounded-lg hover:bg-navy-800 transition-colors font-medium"
                  >
                    🔐 Admin Login
                  </a>
                  <a
                    href="/"
                    className="text-center bg-gray-200 text-navy-900 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    🏠 Home
                  </a>
                </div>
              </div>

              {!status?.success && (
                <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Possible Solutions:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Check POSTGRES_URL environment variable in Vercel</li>
                    <li>✅ Check NEXTAUTH_SECRET environment variable in Vercel</li>
                    <li>✅ Verify database is active in Neon dashboard</li>
                    <li>✅ Check Vercel deployment logs for build errors</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
