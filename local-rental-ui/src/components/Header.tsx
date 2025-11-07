interface HeaderProps {
  onShowStats: () => void;
}

export default function Header({ onShowStats }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-xl relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="relative px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left side - Project branding */}
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-white/20 backdrop-blur p-2.5 rounded-xl">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Local Rental Properties
                  </h1>
                  <p className="text-blue-100 text-sm font-medium">
                    Portuguese Accommodation Registry
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onShowStats}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Statistics
            </button>

            <a
              href="https://www.ptalmeida.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <span>Pedro Almeida</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400"></div>
    </header>
  );
}
