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
    <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl overflow-y-auto z-10 border-l-4 border-blue-600">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start shadow-lg z-10">
        <div>
          <h2 className="text-xl font-bold mb-1">Property Details</h2>
          <p className="text-blue-100 text-sm">Detailed Information</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-lg p-2 transition-all group"
          aria-label="Close"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {property.denominacao || 'Unnamed Property'}
          </h3>
          {property.nr_rnal && (
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm font-bold">RNAL: {property.nr_rnal}</span>
            </div>
          )}
        </section>

        {/* Classification */}
        {property.modalidade && (
          <section className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Classification
              </h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">{property.modalidade}</p>
          </section>
        )}

        {/* Capacity */}
        {property.nr_utentes && (
          <section className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Capacity
              </h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">{property.nr_utentes} people</p>
          </section>
        )}

        {/* Location */}
        <section className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Location
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            {property.endereco && <p className="text-gray-700">{property.endereco}</p>}
            {property.codigo_postal && <p className="text-gray-700">{property.codigo_postal}</p>}
            {property.localidade && <p className="text-gray-700">{property.localidade}</p>}
            {property.freguesia && <p className="text-gray-600 italic">{property.freguesia}</p>}
            {property.concelho && <p className="font-semibold text-gray-900">{property.concelho}</p>}
            {property.distrito && <p className="font-bold text-blue-600">{property.distrito}</p>}
          </div>
          {property.latitude && property.longitude && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-mono">
                📍 {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </section>

        {/* Contact */}
        {property.email && (
          <section className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Contact
              </h4>
            </div>
            <a
              href={`mailto:${property.email}`}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium inline-flex items-center gap-2 group"
            >
              {property.email}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </section>
        )}

        {/* Dates */}
        <section className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Registration Info
            </h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Registration Date</span>
              <span className="font-semibold text-gray-900">{formatDate(property.data_registo)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Opening Date</span>
              <span className="font-semibold text-gray-900">{formatDate(property.data_abertura_publico)}</span>
            </div>
            {property.created_at && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Added to System</span>
                <span className="font-semibold text-gray-900">{formatDate(property.created_at)}</span>
              </div>
            )}
          </div>
        </section>

        {/* ID */}
        <section className="text-center">
          <p className="text-xs text-gray-400 font-mono">Property ID: {property.id}</p>
        </section>
      </div>
    </div>
  );
}
