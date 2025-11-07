import { useState, useEffect, useRef } from 'react';
import type { Property } from '../services/api';
import { theme } from '../theme';

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
  const propertyRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch({});
  };

  // Scroll to selected property
  useEffect(() => {
    if (selectedProperty && selectedProperty.id && propertyRefs.current[selectedProperty.id]) {
      propertyRefs.current[selectedProperty.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedProperty]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: theme.colors.grayBg,
      borderRight: `1px solid ${theme.colors.border}`,
    }}>
      {/* Header */}
      <div style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.white,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.xs,
        }}>
          <h2 style={{
            fontFamily: theme.typography.fontHeading,
            fontSize: theme.typography.sizeXl,
            fontWeight: theme.typography.weightBold,
            color: theme.colors.navy,
            marginBottom: 0,
          }}>
            Properties
          </h2>
          <span style={{
            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
            backgroundColor: theme.colors.navy,
            color: theme.colors.white,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.sizeSm,
            fontWeight: theme.typography.weightBold,
          }}>
            {totalCount.toLocaleString()}
          </span>
        </div>
        <p style={{
          fontSize: theme.typography.sizeSm,
          color: theme.colors.textMedium,
          marginBottom: 0,
        }}>
          {properties.length} loaded
        </p>
      </div>

      {/* Filters Toggle */}
      <div style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        backgroundColor: theme.colors.grayBg,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%',
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            fontSize: theme.typography.sizeSm,
            fontWeight: theme.typography.weightSemiBold,
            backgroundColor: theme.colors.white,
            color: theme.colors.navy,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: theme.transitions.fast,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </span>
          <svg
            style={{
              width: '20px',
              height: '20px',
              transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
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
        <div className="px-6 py-4 bg-[#f8f8f8]" style={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'basic'
                  ? 'bg-[#0f2f7f] text-white neumorphic'
                  : 'bg-white hover:neumorphic-sm'
              }`}
              style={{ border: 'none', color: activeTab === 'basic' ? 'white' : '#0f2f7f' }}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'advanced'
                  ? 'bg-[#0f2f7f] text-white neumorphic'
                  : 'bg-white hover:neumorphic-sm'
              }`}
              style={{ border: 'none', color: activeTab === 'advanced' ? 'white' : '#0f2f7f' }}
            >
              Advanced
            </button>
          </div>

          {/* Basic Filters */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                  📍 District (Distrito)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lisboa, Porto"
                  value={filters.distrito || ''}
                  onChange={(e) => handleFilterChange('distrito', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                  🏘️ Municipality (Concelho)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cascais, Matosinhos"
                  value={filters.concelho || ''}
                  onChange={(e) => handleFilterChange('concelho', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                  🏠 Type (Modalidade)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Apartamento, Moradia"
                  value={filters.modalidade || ''}
                  onChange={(e) => handleFilterChange('modalidade', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    👥 Min Cap.
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_capacity || ''}
                    onChange={(e) => handleFilterChange('min_capacity', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    👥 Max Cap.
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={filters.max_capacity || ''}
                    onChange={(e) => handleFilterChange('max_capacity', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                  📧 Owner Email
                </label>
                <input
                  type="email"
                  placeholder="owner@example.com"
                  value={filters.email || ''}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    📐 Min Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="36.5"
                    value={filters.min_lat || ''}
                    onChange={(e) => handleFilterChange('min_lat', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    📐 Max Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="42.5"
                    value={filters.max_lat || ''}
                    onChange={(e) => handleFilterChange('max_lat', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    📍 Min Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="-9.5"
                    value={filters.min_lng || ''}
                    onChange={(e) => handleFilterChange('min_lng', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    📍 Max Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="-6.0"
                    value={filters.max_lng || ''}
                    onChange={(e) => handleFilterChange('max_lng', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    🔀 Sort By
                  </label>
                  <select
                    value={filters.sort || ''}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
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
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.8)' }}>
                    📊 Order
                  </label>
                  <select
                    value={filters.order || ''}
                    onChange={(e) => handleFilterChange('order', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg neumorphic-inset bg-white focus:neumorphic"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', outline: 'none' }}
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
            className="w-full mt-4 px-4 py-3 text-sm font-semibold bg-white rounded-lg hover:neumorphic neumorphic-sm"
            style={{ color: '#0f2f7f', border: 'none' }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Property List Container - with fixed dimensions */}
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Loading State Overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.grayBg,
            zIndex: 10,
          }}>
            <div style={{ position: 'relative' }}>
              <div className="animate-spin" style={{
                borderRadius: '9999px',
                height: '48px',
                width: '48px',
                border: '4px solid #dbeafe',
              }}></div>
              <div className="animate-spin" style={{
                borderRadius: '9999px',
                height: '48px',
                width: '48px',
                border: '4px solid #2563eb',
                borderTopColor: 'transparent',
                position: 'absolute',
                top: 0,
                left: 0,
              }}></div>
            </div>
          </div>
        )}

        {/* Scrollable Property List */}
        <div style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
        {!isLoading && properties.length === 0 && (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 font-medium">No properties found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {!isLoading && properties.map((property) => {
          const formatDate = (dateString?: string) => {
            if (!dateString) return null;
            return new Date(dateString).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
          };

          return (
            <div
              key={property.id}
              ref={(el) => {
                if (property.id) propertyRefs.current[property.id] = el;
              }}
              onClick={() => onPropertySelect(property)}
              style={{
                position: 'relative',
                margin: theme.spacing.sm,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadius.sm,
                border: selectedProperty?.id === property.id
                  ? `2px solid ${theme.colors.navy}`
                  : `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
            >
              {/* Header: Title + RNAL */}
              <div style={{ marginBottom: theme.spacing.sm }}>
                <h3 style={{
                  fontFamily: theme.typography.fontHeading,
                  fontWeight: theme.typography.weightBold,
                  fontSize: theme.typography.sizeSm,
                  color: theme.colors.navy,
                  marginBottom: '2px',
                  lineHeight: theme.typography.lineHeightTight,
                }}>
                  {property.denominacao || 'Unnamed Property'}
                </h3>
                {property.nr_rnal && (
                  <a
                    href={`https://rnt.turismodeportugal.pt/RNT/RNAL.aspx?nr=${property.nr_rnal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-block',
                      backgroundColor: theme.colors.navy,
                      color: theme.colors.white,
                      padding: `2px ${theme.spacing.sm}`,
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: theme.typography.weightBold,
                      marginTop: '2px',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: theme.transitions.fast,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.navyDark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.navy;
                    }}
                  >
                    {property.nr_rnal}
                  </a>
                )}
              </div>

              {/* Two-column grid for dense information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: `${theme.spacing.xs} ${theme.spacing.sm}`,
                fontSize: '10px',
                marginBottom: theme.spacing.sm,
              }}>
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {property.modalidade && (
                    <div style={{ color: theme.colors.textDark, fontWeight: theme.typography.weightSemiBold }}>
                      {property.modalidade}
                    </div>
                  )}
                  {property.concelho && (
                    <div style={{ color: theme.colors.textMedium }}>
                      {property.concelho}
                    </div>
                  )}
                  {property.distrito && (
                    <div style={{ color: theme.colors.textLight }}>
                      {property.distrito}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                  {property.nr_utentes && (
                    <div style={{ color: theme.colors.textDark, fontWeight: theme.typography.weightBold }}>
                      👥 {property.nr_utentes}
                    </div>
                  )}
                  {property.codigo_postal && (
                    <div style={{ color: theme.colors.textMedium }}>
                      {property.codigo_postal}
                    </div>
                  )}
                  {property.data_registo && (
                    <div style={{ color: theme.colors.textLight }}>
                      {formatDate(property.data_registo)}
                    </div>
                  )}
                </div>
              </div>

              {/* Address - full width */}
              {property.endereco && (
                <div style={{
                  fontSize: '10px',
                  color: theme.colors.textMedium,
                  marginBottom: theme.spacing.xs,
                  lineHeight: 1.3,
                }}>
                  📍 {property.endereco}
                  {property.localidade && `, ${property.localidade}`}
                </div>
              )}

              {/* Contact + Coordinates row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: theme.spacing.xs,
                borderTop: `1px solid ${theme.colors.border}`,
                fontSize: '9px',
              }}>
                {property.email ? (
                  <a
                    href={`mailto:${property.email}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: theme.colors.navy,
                      textDecoration: 'none',
                      fontWeight: theme.typography.weightSemiBold,
                      maxWidth: '60%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📧 {property.email}
                  </a>
                ) : (
                  <span style={{ color: theme.colors.textLight }}>No contact</span>
                )}

                {property.latitude && property.longitude && (
                  <span style={{
                    color: theme.colors.textLight,
                    fontFamily: 'monospace',
                  }}>
                    {property.latitude.toFixed(3)}, {property.longitude.toFixed(3)}
                  </span>
                )}
              </div>

              {/* Selected indicator */}
              {selectedProperty?.id === property.id && (
                <div style={{
                  position: 'absolute',
                  top: theme.spacing.sm,
                  right: theme.spacing.sm,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.navy,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
