import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import PropertyList, { type SearchFilters } from './components/PropertyList';
import StatsPanel from './components/StatsPanel';
import { api, type Property } from './services/api';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Load properties
  const loadProperties = useCallback(async (filters: SearchFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

      const data = hasFilters
        ? await api.searchProperties({
            ...filters,
            limit: 100, // Load more for map visualization
          })
        : await api.getProperties({ limit: 100 });

      setProperties(data?.data || []);
      setTotalCount(data?.pagination?.total || 0);
    } catch (err) {
      setError('Failed to load properties. Make sure the API is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSearch = (filters: SearchFilters) => {
    loadProperties(filters);
    setSelectedProperty(null);
  };

  const handleSearchHere = (bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number }) => {
    loadProperties(bounds);
    setSelectedProperty(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header onShowStats={() => setShowStats(!showStats)} showStats={showStats} />

      {/* Main Content */}
      {showStats ? (
        // Full-screen stats view
        <StatsPanel onClose={() => setShowStats(false)} />
      ) : (
        // Map view with sidebar
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}>
          {/* Sidebar - Property List */}
          <div style={{
            width: '384px',
            minWidth: '384px',
            maxWidth: '384px',
            height: '100%',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <PropertyList
              properties={properties}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
              onSearch={handleSearch}
              isLoading={isLoading}
              totalCount={totalCount}
            />
          </div>

          {/* Main Content - Map */}
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#f3f4f6',
            overflow: 'hidden',
            minWidth: 0,
          }}>
            {/* Error Message */}
            {error && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl shadow-2xl max-w-md animate-bounce">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold text-sm">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            {!error && (
              <Map
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                onSearchHere={handleSearchHere}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
