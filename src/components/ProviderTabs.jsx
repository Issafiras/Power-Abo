/**
 * ProviderTabs komponent
 * Filtrerer planer baseret på valgt provider
 */

export default function ProviderTabs({ activeProvider, onProviderChange, onSearch, searchQuery }) {
  const providers = [
    { id: 'all', name: 'Alle', icon: '📱' },
    { id: 'telmore', name: 'Telmore', icon: '🟠' },
    { id: 'telenor', name: 'Telenor', icon: '🔵' },
    { id: 'cbb', name: 'CBB', icon: '🟣' }
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
            <span className="tab-icon">{provider.icon}</span>
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

