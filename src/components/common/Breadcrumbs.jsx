/**
 * Breadcrumbs komponent
 * Viser navigation path og gør det let at hoppe mellem sektioner
 */

import Icon from './Icon';

const sections = [
  { id: 'customer-situation', label: 'Kundens Situation', icon: 'chart' },
  { id: 'plans-section', label: 'Abonnementer', icon: 'smartphone' },
  { id: 'comparison-section', label: 'Sammenligning', icon: 'chart' }
];

function Breadcrumbs({ currentSection, onSectionClick }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 120; // Header height on desktop
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 16;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (onSectionClick) {
        onSectionClick(sectionId);
      }
    }
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumbs__list">
        {sections.map((section, index) => {
          const isActive = currentSection === section.id;
          const isPast = sections.findIndex(s => s.id === currentSection) > index;

          return (
            <li key={section.id} className="breadcrumbs__item">
              {index > 0 && (
                <Icon 
                  name="chevronRight" 
                  size={14} 
                  className="breadcrumbs__separator"
                  aria-hidden="true"
                />
              )}
              <button
                className={`breadcrumbs__link ${isActive ? 'breadcrumbs__link--active' : ''} ${isPast ? 'breadcrumbs__link--past' : ''}`}
                onClick={() => scrollToSection(section.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Gå til ${section.label}`}
              >
                <Icon name={section.icon} size={14} className="breadcrumbs__icon" aria-hidden="true" />
                <span className="breadcrumbs__label">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <style>{`
        .breadcrumbs {
          display: none; /* Skjul på mobil */
          padding: var(--spacing-sm) var(--container-padding);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          position: sticky;
          top: 120px; /* Header height */
          z-index: calc(var(--z-sticky) - 1);
          margin-top: -1px;
          transition: all var(--transition-base);
        }

        @media (min-width: 901px) {
          .breadcrumbs {
            display: block;
          }
        }

        .breadcrumbs__list {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          list-style: none;
          margin: 0;
          padding: 0;
          max-width: var(--container-max-width);
          margin-left: auto;
          margin-right: auto;
        }

        .breadcrumbs__item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .breadcrumbs__separator {
          color: rgba(255, 255, 255, 0.2);
          margin: 0 var(--spacing-xs);
          transition: color var(--transition-fast);
        }

        .breadcrumbs__link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-md);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: var(--font-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          position: relative;
          min-height: 32px;
        }

        .breadcrumbs__link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .breadcrumbs__link:hover {
          color: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .breadcrumbs__link:hover::before {
          opacity: 1;
        }

        .breadcrumbs__link--active {
          color: var(--color-orange);
          background: linear-gradient(135deg, rgba(255, 109, 31, 0.15), rgba(255, 109, 31, 0.08));
          font-weight: var(--font-semibold);
          box-shadow: 0 0 16px rgba(255, 109, 31, 0.2);
        }

        .breadcrumbs__link--active::before {
          opacity: 0;
        }

        .breadcrumbs__link--past {
          color: rgba(255, 255, 255, 0.7);
        }

        .breadcrumbs__link--past:hover {
          color: rgba(255, 255, 255, 0.95);
        }

        .breadcrumbs__icon {
          flex-shrink: 0;
          transition: transform var(--transition-fast);
        }

        .breadcrumbs__link:hover .breadcrumbs__icon {
          transform: scale(1.1);
        }

        .breadcrumbs__link--active .breadcrumbs__icon {
          color: var(--color-orange);
        }

        .breadcrumbs__label {
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
      `}</style>
    </nav>
  );
}

export default Breadcrumbs;

