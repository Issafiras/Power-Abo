/**
 * ProviderTabs komponent
 * Filtrerer planer baseret på valgt provider
 */

// Provider logo mapping
const providerLogos = {
  telenor: '/Power-Abo/logos/Telenor.png',
  telmore: '/Power-Abo/logos/Telmore.png',
  cbb: '/Power-Abo/logos/CBB.png'
};

export default function ProviderTabs({ activeProvider, onProviderChange, onSearch, searchQuery }) {
  const providers = [
    { id: 'all', name: 'Alle', icon: '📱' },
    { id: 'telmore', name: 'Telmore', logo: providerLogos.telmore },
    { id: 'telenor', name: 'Telenor', logo: providerLogos.telenor },
    { id: 'cbb', name: 'CBB', logo: providerLogos.cbb }
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

      {/* Søgefelt */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Søg efter planer, data, features..."
          className="input search-input"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Søg i planer"
        />
        <span className="search-icon">🔍</span>
      </div>

      <style jsx>{`
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
          height: 20px;
          width: auto;
          max-width: 80px;
          object-fit: contain;
          transition: all var(--transition-smooth);
        }

        .tab:hover .tab-logo {
          transform: scale(1.1);
          filter: brightness(1.2);
        }

        .tab-active .tab-logo {
          filter: brightness(1.3);
        }

        .tab-name {
          font-size: var(--font-sm);
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

