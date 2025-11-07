import type { Property } from '../services/api';

interface PropertyDetailProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  if (!property) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-[#EFEFEF] overflow-y-auto z-10 neumorphic-lg" style={{ borderLeft: '4px solid #0f2f7f' }}>
      {/* Header */}
      <div className="sticky top-0 bg-white p-6 flex justify-between items-start neumorphic-sm z-10">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#0f2f7f' }}>
            Property Details
          </h2>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)', marginBottom: 0 }}>Detailed Information</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#0f2f7f] hover:bg-[#EFEFEF] rounded-lg p-2 group"
          aria-label="Close"
        >
          <svg className="w-6 h-6 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Basic Info */}
        <section className="bg-white p-5 rounded-lg neumorphic">
          <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif', color: '#0f2f7f' }}>
            {property.denominacao || 'Unnamed Property'}
          </h3>
          {property.nr_rnal && (
            <div className="inline-flex items-center gap-2 bg-[#0f2f7f] text-white px-4 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm font-bold">RNAL: {property.nr_rnal}</span>
            </div>
          )}
        </section>

        {/* Classification */}
        {property.modalidade && (
          <section className="bg-white p-5 rounded-lg neumorphic-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#EFEFEF] p-2 rounded-lg">
                <svg className="w-5 h-5" style={{ color: '#0f2f7f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Classification
              </h4>
            </div>
            <p className="text-lg font-semibold" style={{ color: 'rgba(0,0,0,0.8)' }}>{property.modalidade}</p>
          </section>
        )}

        {/* Capacity */}
        {property.nr_utentes && (
          <section className="bg-white p-5 rounded-lg neumorphic-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#EFEFEF] p-2 rounded-lg">
                <svg className="w-5 h-5" style={{ color: '#0f2f7f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Capacity
              </h4>
            </div>
            <p className="text-lg font-semibold" style={{ color: 'rgba(0,0,0,0.8)' }}>{property.nr_utentes} people</p>
          </section>
        )}

        {/* Location */}
        <section className="bg-white p-5 rounded-lg neumorphic-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#EFEFEF] p-2 rounded-lg">
              <svg className="w-5 h-5" style={{ color: '#0f2f7f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.6)' }}>
              Location
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            {property.endereco && <p style={{ color: 'rgba(0,0,0,0.8)' }}>{property.endereco}</p>}
            {property.codigo_postal && <p style={{ color: 'rgba(0,0,0,0.8)' }}>{property.codigo_postal}</p>}
            {property.localidade && <p style={{ color: 'rgba(0,0,0,0.8)' }}>{property.localidade}</p>}
            {property.freguesia && <p style={{ color: 'rgba(0,0,0,0.6)', fontStyle: 'italic' }}>{property.freguesia}</p>}
            {property.concelho && <p className="font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>{property.concelho}</p>}
            {property.distrito && <p className="font-bold" style={{ color: '#0f2f7f' }}>{property.distrito}</p>}
          </div>
          {property.latitude && property.longitude && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}>
              <p className="text-xs font-mono" style={{ color: 'rgba(0,0,0,0.5)' }}>
                📍 {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </section>

        {/* Contact */}
        {property.email && (
          <section className="bg-white p-5 rounded-lg neumorphic-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#EFEFEF] p-2 rounded-lg">
                <svg className="w-5 h-5" style={{ color: '#0f2f7f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Contact
              </h4>
            </div>
            <a
              href={`mailto:${property.email}`}
              className="text-sm font-medium inline-flex items-center gap-2 group hover:underline"
              style={{ color: '#0f2f7f', fontStyle: 'italic' }}
            >
              {property.email}
              <svg className="w-4 h-4 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </section>
        )}

        {/* Dates */}
        <section className="bg-white p-5 rounded-lg neumorphic-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#EFEFEF] p-2 rounded-lg">
              <svg className="w-5 h-5" style={{ color: '#0f2f7f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.6)' }}>
              Registration Info
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-3 bg-[#EFEFEF] rounded-lg">
              <span style={{ color: 'rgba(0,0,0,0.6)' }}>Registration Date</span>
              <span className="font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>{formatDate(property.data_registo)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#EFEFEF] rounded-lg">
              <span style={{ color: 'rgba(0,0,0,0.6)' }}>Opening Date</span>
              <span className="font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>{formatDate(property.data_abertura_publico)}</span>
            </div>
            {property.created_at && (
              <div className="flex justify-between items-center p-3 bg-[#EFEFEF] rounded-lg">
                <span style={{ color: 'rgba(0,0,0,0.6)' }}>Added to System</span>
                <span className="font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>{formatDate(property.created_at)}</span>
              </div>
            )}
          </div>
        </section>

        {/* ID */}
        <section className="text-center">
          <p className="text-xs font-mono" style={{ color: 'rgba(0,0,0,0.4)' }}>Property ID: {property.id}</p>
        </section>
      </div>
    </div>
  );
}
