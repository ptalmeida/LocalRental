import { useEffect, useState } from 'react';
import { api, type Stats } from '../services/api';

interface StatsPanelProps {
  onClose: () => void;
}

export default function StatsPanel({ onClose }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white p-8 flex justify-between items-start rounded-t-3xl shadow-lg z-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Statistics Dashboard</h2>
            <p className="text-blue-100">Comprehensive data analysis & insights</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl p-3 transition-all group"
            aria-label="Close"
          >
            <svg className="w-7 h-7 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-20">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading statistics...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {stats && !isLoading && (
            <div className="space-y-8">
              {/* Overview Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-wide">
                        Total Properties
                      </h3>
                    </div>
                    <p className="text-5xl font-bold">
                      {stats.total_accommodations?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-wide">
                        Average Capacity
                      </h3>
                    </div>
                    <p className="text-5xl font-bold">
                      {stats.average_capacity?.toFixed(1) || 0}
                    </p>
                  </div>
                </div>
              </section>

              {/* By Type */}
              {stats.by_modalidade && stats.by_modalidade.length > 0 && (
                <section className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="bg-purple-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </span>
                    By Property Type
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.by_modalidade
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .map((item, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100 hover:shadow-lg transition-all">
                          <p className="font-bold text-gray-900 text-lg mb-2">{item.modalidade}</p>
                          <p className="text-4xl font-bold text-purple-600">
                            {item.count?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* By District */}
              {stats.by_distrito && stats.by_distrito.length > 0 && (
                <section className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </span>
                    By District (Top 10)
                  </h3>
                  <div className="space-y-3">
                    {stats.by_distrito
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .slice(0, 10)
                      .map((item, idx) => {
                        const maxCount = stats.by_distrito![0]?.count || 1;
                        const percentage = ((item.count || 0) / maxCount) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-900">{item.distrito}</span>
                                <span className="text-sm font-bold text-blue-600">{item.count?.toLocaleString()}</span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* By Municipality */}
              {stats.by_concelho && stats.by_concelho.length > 0 && (
                <section className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="bg-amber-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    By Municipality (Top 15)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.by_concelho
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .slice(0, 15)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border-2 border-amber-100">
                          <span className="text-sm font-bold text-gray-900 truncate">
                            {item.concelho}
                          </span>
                          <span className="text-base font-bold text-amber-600 ml-3">
                            {item.count?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
