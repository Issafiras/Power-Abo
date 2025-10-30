/**
 * ProviderTabs komponent
 * Filtrerer planer baseret på valgt provider
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
      {/* Tabs */}
      <div className="tabs">
        {providers.map(provider => (
          <button
            key={provider.id}
            onClick={() => onProviderChange(provider.id)}
            className={`tab ${activeProvider === provider.id ? 'tab-active' : ''}`}
            aria-pressed={activeProvider === provider.id}
          >
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
          </button>
        ))}
      </div>

      {/* Telenor segment underfaner */}
      {(activeProvider === 'telenor' || activeProvider === 'telenor-b2b') && (
        <div className="segment-toggle">
          <button
            className={`segment-btn ${activeProvider === 'telenor' ? 'active' : ''}`}
            onClick={() => onProviderChange('telenor')}
            aria-pressed={activeProvider === 'telenor'}
          >
            Privat
          </button>
          <button
            className={`segment-btn ${activeProvider === 'telenor-b2b' ? 'active' : ''}`}
            onClick={() => onProviderChange('telenor-b2b')}
            aria-pressed={activeProvider === 'telenor-b2b'}
          >
            B2B
          </button>
        </div>
      )}

      {/* Søgefelt */}
      <div className="search-container">
        <input
          id="search-query"
          name="search-query"
          type="text"
          placeholder="Søg efter abonnementer, data, funktioner..."
          className="input search-input"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Søg i abonnementer"
        />
        <span className="search-icon">🔍</span>
      </div>

      <style>{`
        .provider-tabs-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .tab-icon {
          font-size: var(--font-lg);
        }

        .tab-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 4px;
        }

        .tab-name {
          font-size: var(--font-sm);
        }

        .segment-toggle {
          display: inline-flex;
          gap: 8px;
        }

        .segment-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.15);
          background: var(--glass-bg);
          color: var(--text-primary);
        }

        .segment-btn.active {
          background: var(--color-orange);
          color: white;
          border-color: var(--color-orange);
        }

        .search-container {
          position: relative;
        }

        .search-input {
          padding-right: 3rem;
        }

        .search-icon {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          font-size: var(--font-lg);
          opacity: 0.5;
        }

        @media (max-width: 900px) {
          .tab-name {
            font-size: var(--font-xs);
          }
        }
      `}</style>
    </div>
  );
}

