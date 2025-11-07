import { useState } from 'react';
import type { Property } from '../services/api';

interface PropertyListProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
  totalCount: number;
}

export interface SearchFilters {
  distrito?: string;
  concelho?: string;
  modalidade?: string;
  email?: string;
  min_capacity?: number;
  max_capacity?: number;
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
  sort?: string;
  order?: string;
}

export default function PropertyList({
  properties,
  selectedProperty,
  onPropertySelect,
  onSearch,
  isLoading,
  totalCount,
}: PropertyListProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch({});
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white shadow-xl border-r border-gray-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Properties</h2>
          <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
            {totalCount.toLocaleString()}
          </span>
        </div>
        <p className="text-blue-100 text-sm">{properties.length} loaded</p>
      </div>

      {/* Filters Toggle */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 flex items-center justify-between group"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'basic'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'advanced'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Basic Filters */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  📍 District (Distrito)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lisboa, Porto"
                  value={filters.distrito || ''}
                  onChange={(e) => handleFilterChange('distrito', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  🏘️ Municipality (Concelho)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cascais, Matosinhos"
                  value={filters.concelho || ''}
                  onChange={(e) => handleFilterChange('concelho', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  🏠 Type (Modalidade)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Apartamento, Moradia"
                  value={filters.modalidade || ''}
                  onChange={(e) => handleFilterChange('modalidade', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    👥 Min Cap.
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_capacity || ''}
                    onChange={(e) => handleFilterChange('min_capacity', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    👥 Max Cap.
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={filters.max_capacity || ''}
                    onChange={(e) => handleFilterChange('max_capacity', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  📧 Owner Email
                </label>
                <input
                  type="email"
                  placeholder="owner@example.com"
                  value={filters.email || ''}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    📐 Min Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="36.5"
                    value={filters.min_lat || ''}
                    onChange={(e) => handleFilterChange('min_lat', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    📐 Max Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="42.5"
                    value={filters.max_lat || ''}
                    onChange={(e) => handleFilterChange('max_lat', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    📍 Min Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="-9.5"
                    value={filters.min_lng || ''}
                    onChange={(e) => handleFilterChange('min_lng', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    📍 Max Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="-6.0"
                    value={filters.max_lng || ''}
                    onChange={(e) => handleFilterChange('max_lng', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    🔀 Sort By
                  </label>
                  <select
                    value={filters.sort || ''}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Default</option>
                    <option value="id">ID</option>
                    <option value="nr_rnal">RNAL</option>
                    <option value="denominacao">Name</option>
                    <option value="concelho">Municipality</option>
                    <option value="distrito">District</option>
                    <option value="created_at">Date Added</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    📊 Order
                  </label>
                  <select
                    value={filters.order || ''}
                    onChange={(e) => handleFilterChange('order', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Default</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="w-full mt-4 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      )}

      {/* Property List */}
      <div className="flex-1 overflow-y-auto">
        {!isLoading && properties.length === 0 && (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 font-medium">No properties found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {!isLoading && properties.map((property) => (
          <div
            key={property.id}
            onClick={() => onPropertySelect(property)}
            className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
              selectedProperty?.id === property.id
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-l-blue-600 shadow-md'
                : 'hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {property.denominacao || 'Unnamed Property'}
                </h3>
                {property.nr_rnal && (
                  <p className="text-xs text-blue-600 font-semibold mb-2">RNAL: {property.nr_rnal}</p>
                )}
                <div className="space-y-1">
                  {property.modalidade && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-gray-400">🏠</span>
                      {property.modalidade}
                    </p>
                  )}
                  {property.concelho && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-gray-400">📍</span>
                      {property.concelho}{property.distrito && `, ${property.distrito}`}
                    </p>
                  )}
                  {property.nr_utentes && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-gray-400">👥</span>
                      Capacity: {property.nr_utentes}
                    </p>
                  )}
                </div>
              </div>
              {selectedProperty?.id === property.id && (
                <div className="ml-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
