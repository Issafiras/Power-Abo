/**
 * ProviderTabs komponent - Steve Jobs Design
 * Perfekt minimalistisk design med elegant spacing og animationer
 */

export default function ProviderTabs({ activeProvider, onProviderChange, onSearch, searchQuery }) {
  const providers = [
    { id: 'all', name: 'Alle', icon: '📱' },
    { id: 'telmore', name: 'Telmore', icon: '🟠', logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png' },
    { id: 'telenor', name: 'Telenor', icon: '🔵', logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png' },
    { id: 'cbb', name: 'CBB', icon: '🟣', logo: 'https://issafiras.github.io/Power-Abo/logos/CBB_Mobil_800x400.png' }
  ];

  return (
    <div className="provider-tabs-container">
      {/* Main Tabs - Apple Perfect Design */}
      <div className="tabs-wrapper">
        <div className="tabs">
          {providers.map((provider, index) => (
            <button
              key={provider.id}
              onClick={() => onProviderChange(provider.id)}
              className={`tab ${activeProvider === provider.id ? 'tab-active' : ''}`}
              style={{ animationDelay: `${index * 60}ms` }}
              aria-pressed={activeProvider === provider.id}
              aria-label={`Vis ${provider.name} abonnementer`}
            >
              <span className="tab-content">
                {provider.logo ? (
                  <img 
                    src={provider.logo} 
                    alt={provider.name}
                    className="tab-logo"
                  />
                ) : (
                  <span className="tab-icon">{provider.icon}</span>
                )}
                <span className="tab-name">{provider.name}</span>
              </span>
              {activeProvider === provider.id && (
                <span className="tab-indicator" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Segment Controls - Refined Apple Segmented Control */}
      {(activeProvider === 'telenor' || activeProvider === 'telenor-b2b' || activeProvider === 'telenor-bredbånd') && (
        <div className="segment-control">
          <div className="segment-control-wrapper">
            <button
              className={`segment-btn ${activeProvider === 'telenor' ? 'segment-btn-active' : ''}`}
              onClick={() => onProviderChange('telenor')}
              aria-pressed={activeProvider === 'telenor'}
              aria-label="Vis Telenor privat abonnementer"
            >
              <span>Privat</span>
            </button>
            <button
              className={`segment-btn ${activeProvider === 'telenor-b2b' ? 'segment-btn-active' : ''}`}
              onClick={() => onProviderChange('telenor-b2b')}
              aria-pressed={activeProvider === 'telenor-b2b'}
              aria-label="Vis Telenor B2B abonnementer"
            >
              <span>B2B</span>
            </button>
            <button
              className={`segment-btn ${activeProvider === 'telenor-bredbånd' ? 'segment-btn-active' : ''}`}
              onClick={() => onProviderChange('telenor-bredbånd')}
              aria-pressed={activeProvider === 'telenor-bredbånd'}
              aria-label="Vis Telenor bredbånd abonnementer"
            >
              <span>Bredbånd</span>
            </button>
          </div>
        </div>
      )}

      {(activeProvider === 'telmore' || activeProvider === 'telmore-bredbånd') && (
        <div className="segment-control">
          <div className="segment-control-wrapper">
            <button
              className={`segment-btn ${activeProvider === 'telmore' ? 'segment-btn-active' : ''}`}
              onClick={() => onProviderChange('telmore')}
              aria-pressed={activeProvider === 'telmore'}
              aria-label="Vis Telmore mobil abonnementer"
            >
              <span>Mobil</span>
            </button>
            <button
              className={`segment-btn ${activeProvider === 'telmore-bredbånd' ? 'segment-btn-active' : ''}`}
              onClick={() => onProviderChange('telmore-bredbånd')}
              aria-pressed={activeProvider === 'telmore-bredbånd'}
              aria-label="Vis Telmore bredbånd abonnementer"
            >
              <span>Bredbånd</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Field - Apple Perfect Input */}
      <div className="search-wrapper">
        <div className="search-container">
          <svg 
            className="search-icon" 
            width="18" 
            height="18" 
            viewBox="0 0 18 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path 
              d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z" 
              fill="currentColor"
            />
          </svg>
          <input
            id="search-query"
            name="search-query"
            type="text"
            placeholder="Søg efter abonnementer..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Søg i abonnementer"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => onSearch('')}
              aria-label="Ryd søgning"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* Container - Perfect Spacing */
        .provider-tabs-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          width: 100%;
        }

        /* Tabs Wrapper - Apple Perfect */
        .tabs-wrapper {
          position: relative;
          width: 100%;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 0.375rem;
          position: relative;
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        /* Individual Tab - Perfect Design */
        .tab {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.25rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          border-radius: 0.75rem;
          overflow: hidden;
          opacity: 0;
          animation: tabFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;  /* Max 300ms */
        }

        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tab-content {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          position: relative;
          z-index: 2;
        }

        .tab-icon {
          font-size: 1.125rem;
          line-height: 1;
          opacity: 0.8;
          transition: opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .tab-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          border-radius: 0.25rem;
          opacity: 0.85;
          transition: opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .tab-name {
          font-weight: 500;
          transition: color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        /* Active Tab - Perfect Highlight */
        .tab-active {
          color: var(--text-primary);
        }

        .tab-active .tab-icon,
        .tab-active .tab-logo {
          opacity: 1;
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #FF6D1F 0%, #FF8F57 100%);
          border-radius: 0 0 0.75rem 0.75rem;
          animation: indicatorSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);  /* Max 300ms */
          box-shadow: 0 0 12px rgba(255, 109, 31, 0.5);
        }

        @keyframes indicatorSlide {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        /* Hover State - Elegant */
        .tab:hover:not(.tab-active) {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .tab:hover:not(.tab-active) .tab-icon,
        .tab:hover:not(.tab-active) .tab-logo {
          opacity: 1;
        }

        /* Active Tab Background */
        .tab-active::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .tab-active::before {
          opacity: 1;
        }

        /* Segment Control - Apple Segmented Control Style */
        .segment-control {
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }

        .segment-control-wrapper {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          padding: 0.25rem;
          gap: 0.25rem;
          box-shadow: 
            0 2px 16px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .segment-btn {
          padding: 0.625rem 1.25rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.005em;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);  /* Max 300ms */
          position: relative;
        }

        .segment-btn:hover:not(.segment-btn-active) {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .segment-btn-active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Search Wrapper - Perfect Apple Input */
        .search-wrapper {
          width: 100%;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.875rem;
          padding: 0.875rem 1rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);  /* Max 300ms */
          box-shadow: 
            0 2px 16px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .search-container:focus-within {
          border-color: rgba(255, 109, 31, 0.4);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            0 0 0 3px rgba(255, 109, 31, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .search-icon {
          width: 18px;
          height: 18px;
          color: var(--text-muted);
          margin-right: 0.75rem;
          flex-shrink: 0;
          transition: color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .search-container:focus-within .search-icon {
          color: var(--text-secondary);
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.9375rem;
          font-weight: 400;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.003em;
          outline: none;
          padding: 0;
          width: 100%;
        }

        .search-input::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .search-clear {
          margin-left: 0.75rem;
          padding: 0.25rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);  /* Max 300ms */
          opacity: 0.7;
        }

        .search-clear:hover {
          opacity: 1;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        /* Responsive - Perfect Mobile */
        @media (max-width: 900px) {
          .provider-tabs-container {
            gap: 1.25rem;
          }

          .tabs {
            padding: 0.25rem;
            gap: 0.375rem;
          }

          .tab {
            padding: 0.75rem 0.875rem;
            font-size: 0.875rem;
          }

          .tab-logo {
            width: 18px;
            height: 18px;
          }

          .tab-icon {
            font-size: 1rem;
          }

          .segment-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8125rem;
          }

          .search-container {
            padding: 0.75rem 0.875rem;
          }

          .search-input {
            font-size: 0.875rem;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .tab,
          .tab-indicator,
          .segment-btn,
          .search-container {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

