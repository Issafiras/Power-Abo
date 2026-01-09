/**
 * ProviderTabs komponent - Steve Jobs Design
 * Perfekt minimalistisk design med elegant spacing og animationer
 */

import React from 'react';

function ProviderTabs({ activeProvider, onProviderChange, onSearch, searchQuery, includeBroadband, onIncludeBroadbandChange }) {
  const providers = [
    { id: 'all', name: 'Alle', icon: '📱' },
    { id: 'telmore', name: 'Telmore', icon: '🟠', logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png' },
    { id: 'telenor', name: 'Telenor', icon: '🔵', logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png' },
    { id: 'cbb', name: 'CBB', icon: '🟣', logo: 'https://issafiras.github.io/Power-Abo/logos/CBB_Mobil_800x400.png' },
    { id: 'broadband', name: 'Bredbånd', icon: '🏠', logo: 'https://issafiras.github.io/Power-Abo/logos/broadband.svg' }
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
                    loading="lazy"
                  />
                ) : (
                  <span className="tab-icon">{provider.icon}</span>
                )}
                <span className="tab-label">{provider.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Segment Controls - Refined Apple Segmented Control */}
      {(activeProvider === 'telenor' || activeProvider === 'telenor-b2b') && (
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
          </div>
        </div>
      )}

      {/* Telmore Segment Controls */}
      {activeProvider === 'telmore' && (
        <div className="segment-control">
          <div className="segment-control-wrapper">
            <button
              className={`segment-btn ${activeProvider === 'telmore' ? 'segment-btn-active' : ''}`}
              onClick={() => onProviderChange('telmore')}
              aria-pressed={activeProvider === 'telmore'}
              aria-label="Vis Telmore privat abonnementer"
            >
              <span>Privat</span>
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

        {/* Broadband Checkbox */}
        {onIncludeBroadbandChange && (
          <div className="broadband-toggle-container">
            <label className="broadband-checkbox-label">
              <input 
                type="checkbox" 
                checked={includeBroadband} 
                onChange={(e) => onIncludeBroadbandChange(e.target.checked)}
                className="broadband-checkbox"
              />
              <span className="broadband-checkbox-text">Internet skal være inkluderet</span>
            </label>
          </div>
        )}
      </div>

      <style>{`
        /* Container - Perfect Spacing */
        .provider-tabs-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        /* Tabs Wrapper - Apple Perfect Design */
        .tabs-wrapper {
          width: 100%;
        }

        .tabs {
          display: flex;
          gap: var(--spacing-xs);
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xs);
          box-shadow: 
            0 2px 16px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .tab {
          flex: 1;
          background: transparent;
          border: none;
          border-radius: var(--radius-lg);
          padding: var(--spacing-md) var(--spacing-lg);
          color: var(--text-secondary);
          font-size: var(--font-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--transition-base);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.01em;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(8px);
          animation: fadeInUp 0.4s ease forwards;
        }

        @keyframes fadeInUp {
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
          justify-content: center;
          gap: var(--spacing-sm);
        }

        .tab-logo {
          height: 20px;
          width: auto;
          object-fit: contain;
          filter: brightness(0.8);
          transition: filter var(--transition-fast);
        }

        .tab-icon {
          font-size: var(--font-lg);
        }

        .tab-label {
          font-weight: var(--font-medium);
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .tab:hover .tab-logo {
          filter: brightness(1);
        }

        .tab:active {
          transform: translateY(0);
        }

        .tab-active {
          background: linear-gradient(135deg, #FF6D1F 0%, #FF8F57 100%);
          color: white;
          box-shadow: 
            0 4px 16px rgba(255, 109, 31, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: var(--font-semibold);
          transform: scale(1.01);
        }

        .tab-active .tab-logo {
          filter: brightness(1.2) contrast(1.1);
        }

        .tab-active:hover {
          background: linear-gradient(135deg, #FF8F57 0%, #FF6D1F 100%);
          transform: translateY(-1px) scale(1.02);
          box-shadow: 
            0 6px 24px rgba(255, 109, 31, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.15) inset;
          filter: brightness(1.05);
        }

        /* Segment Control - Apple Refined */
        .segment-control {
          margin-top: var(--spacing-md);
        }

        .segment-control-wrapper {
          display: flex;
          gap: var(--spacing-xs);
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xs);
        }

        .segment-btn {
          flex: 1;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--text-secondary);
          font-size: var(--font-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }

        .segment-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .segment-btn-active {
          background: linear-gradient(135deg, #FF6D1F 0%, #FF8F57 100%);
          color: white;
          box-shadow: 
            0 2px 8px rgba(255, 109, 31, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          font-weight: var(--font-semibold);
        }

        .segment-btn-active:hover {
          background: linear-gradient(135deg, #FF8F57 0%, #FF6D1F 100%);
          box-shadow: 
            0 4px 12px rgba(255, 109, 31, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          filter: brightness(1.05);
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
          border-color: #FF6D1F;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.35),
            0 0 0 4px rgba(255, 109, 31, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transform: scale(1.01);
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
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-left: var(--spacing-sm);
          padding: 0;
        }

        .search-clear:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        .search-clear:active {
          transform: scale(0.95);
        }

        /* Mobile Responsive */
        @media (max-width: 900px) {
          .tabs {
            gap: var(--spacing-xs);
            padding: var(--spacing-xs);
          }

          .tab {
            padding: var(--spacing-sm) var(--spacing-md);
            font-size: var(--font-xs);
          }

          .tab-logo {
            height: 16px;
          }

          .segment-control-wrapper {
            gap: var(--spacing-xs);
            padding: var(--spacing-xs);
          }

          .segment-btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-xs);
          }

          .search-container {
            padding: var(--spacing-sm) var(--spacing-md);
          }

          .search-input {
            font-size: var(--font-sm);
          }
        }

        /* Broadband Toggle Styles */
        .broadband-toggle-container {
          margin-top: var(--spacing-md);
          display: flex;
          justify-content: flex-start;
          padding: 0 var(--spacing-xs);
        }
        
        .broadband-checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          color: var(--text-secondary);
          font-size: var(--font-sm);
          user-select: none;
          transition: color var(--transition-fast);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }
        
        .broadband-checkbox-label:hover {
          color: var(--text-primary);
        }
        
        .broadband-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          position: relative;
          transition: all var(--transition-fast);
        }
        
        .broadband-checkbox:checked {
          background: linear-gradient(135deg, #FF6D1F 0%, #FF8F57 100%);
          border-color: #FF6D1F;
          box-shadow: 0 2px 8px rgba(255, 109, 31, 0.3);
        }
        
        .broadband-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        .broadband-checkbox:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 109, 31, 0.2);
        }

        .broadband-checkbox-text {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default React.memo(ProviderTabs);
