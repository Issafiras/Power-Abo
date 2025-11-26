/**
 * HelpGuide - Komplet brugsvejledning til Power Abo Beregner
 * Dansk guide til hvordan man bruger applikationen effektivt
 */

import React, { useState, useCallback, useEffect } from 'react';
import Icon from './Icon';
import Button from '../ui/Button';

function HelpGuide({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('introduktion');

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyPress(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  const sections = {
    introduktion: {
      title: 'Introduktion',
      icon: 'info',
      content: (
        <div className="help-section">
          <h3>Hvad er Power Abo Beregner?</h3>
          <p>
            Power Abo Beregner er et professionelt værktøj designet specifikt til POWER-forretningerne.
            Det hjælper salgsassistenter med hurtigt at beregne den optimale kombination af mobilabonnementer,
            streaming-tjenester og bredbånd til kunderne.
          </p>

          <h4>Kernefunktioner:</h4>
          <ul>
            <li><strong>Automatisk løsningsforslag:</strong> Systemet finder den bedste pakke baseret på kundens behov</li>
            <li><strong>6-måneders analyse:</strong> Alle beregninger er baseret på 6 måneders samlede omkostninger</li>
            <li><strong>Familierabat:</strong> Automatisk beregning af Telenor familierabat (50 kr/md pr. ekstra linje)</li>
            <li><strong>Streaming-integration:</strong> CBB MIX bundling og individuelle streaming-tjenester</li>
            <li><strong>EAN-søgning:</strong> Integration med Power.dk for produktsøgning</li>
          </ul>
        </div>
      )
    },

    komigang: {
      title: 'Kom i gang',
      icon: 'rocket',
      content: (
        <div className="help-section">
          <h3>Hurtig startguide</h3>

          <div className="help-step">
            <div className="help-step-number">1</div>
            <div className="help-step-content">
              <h4>Indtast kundens situation</h4>
              <p>Udfyld hvor meget kunden betaler i dag for mobil og streaming-tjenester. Dette hjælper systemet med at beregne besparelser.</p>
            </div>
          </div>

          <div className="help-step">
            <div className="help-step-number">2</div>
            <div className="help-step-content">
              <h4>Vælg operatør</h4>
              <p>Vælg mellem Telenor, Telmore, CBB eller Bredbånd for at se tilgængelige abonnementer.</p>
            </div>
          </div>

          <div className="help-step">
            <div className="help-step-number">3</div>
            <div className="help-step-content">
              <h4>Vælg abonnementer</h4>
              <p>Klik på abonnementerne du vil tilbyde kunden. Systemet viser automatisk priser og rabatter.</p>
            </div>
          </div>

          <div className="help-step">
            <div className="help-step-number">4</div>
            <div className="help-step-content">
              <h4>Se sammenligningen</h4>
              <p>Rul ned for at se den detaljerede sammenligning over 6 måneder, herunder besparelser og mersalg.</p>
            </div>
          </div>
        </div>
      )
    },

    detaljeret: {
      title: 'Detaljeret guide',
      icon: 'book',
      content: (
        <div className="help-section">
          <h3>Detaljeret brugervejledning</h3>

          <h4>Kundesituation</h4>
          <ul>
            <li><strong>Antal mobilabonnementer:</strong> Hvor mange linjer skal kunden have?</li>
            <li><strong>Nuværende mobiludgifter:</strong> Kundens samlede månedlige udgifter til mobil</li>
            <li><strong>Bredbåndsudgifter:</strong> Kundens nuværende bredbåndsabonnement</li>
            <li><strong>Eksisterende brands:</strong> Hvilke operatører har kunden allerede? (disse ekskluderes fra automatisk løsning)</li>
            <li><strong>Produktpris:</strong> Prisen på telefonen/udstyret inden rabat</li>
          </ul>

          <h4>Streaming-tjenester</h4>
          <p>Vælg de streaming-tjenester kunden ønsker. Bemærk:</p>
          <ul>
            <li><strong>CBB MIX:</strong> Spar op til 8 tjenester til 149 kr/md (kun med CBB mobil)</li>
            <li><strong>Individuelle tjenester:</strong> Netflix, Viaplay, Disney+, osv.</li>
            <li><strong>Automatisk rabat:</strong> Systemet beregner den billigste kombination</li>
          </ul>

          <h4>Abonnementsvalg</h4>
          <ul>
            <li><strong>Telenor:</strong> Familierabat (50 kr/md pr. ekstra linje fra 2. linje)</li>
            <li><strong>Telmore:</strong> Konkurrencedygtige priser uden binding</li>
            <li><strong>CBB:</strong> Bredbånd + mobil kombinationer</li>
            <li><strong>Intro-priser:</strong> Mange abonnementer har billigere intro-priser</li>
          </ul>

          <h4>Kontant rabat</h4>
          <p>Du kan tilføje en ekstra kontantrabat til hele pakken:</p>
          <ul>
            <li>Klik på &quot;Aktivér kontantrabat&quot;</li>
            <li>Indtast rabatbeløbet</li>
            <li>Systemet justerer automatisk alle beregninger</li>
          </ul>
        </div>
      )
    },

    genveje: {
      title: 'Tastaturgenveje',
      icon: 'zap',
      content: (
        <div className="help-section">
          <h3>Tastaturgenveje</h3>
          <p>Brug disse genveje for hurtigere arbejde:</p>

          <div className="keyboard-shortcuts">
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>R</kbd>
              <span>Nulstil alt</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>P</kbd>
              <span>Præsentationsvisning</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>T</kbd>
              <span>Skift tema (mørk/lys)</span>
            </div>
            <div className="shortcut">
              <kbd>Tab</kbd>
              <span>Navigér mellem elementer</span>
            </div>
            <div className="shortcut">
              <kbd>Enter</kbd>
              <span>Aktivér knap/felt</span>
            </div>
            <div className="shortcut">
              <kbd>F1</kbd> eller <kbd>Ctrl</kbd> + <kbd>H</kbd>
              <span>Åbn hjælp</span>
            </div>
            <div className="shortcut">
              <kbd>Escape</kbd>
              <span>Luk modal/vindue</span>
            </div>
          </div>

          <h4>Navigationstips</h4>
          <ul>
            <li>Brug Tab for at navigere gennem alle interaktive elementer</li>
            <li>Pil-tasterne fungerer i dropdown-menuer</li>
            <li>Space eller Enter aktiverer knapper og checkboxes</li>
            <li>Alle funktioner er tilgængelige uden mus</li>
          </ul>
        </div>
      )
    },

    tips: {
      title: 'Pro-tips',
      icon: 'sparkles',
      content: (
        <div className="help-section">
          <h3>Professionelle tips</h3>

          <h4>Salgsteknik</h4>
          <ul>
            <li><strong>Start med kundens behov:</strong> Spørg om antal brugere og budget før du viser tilbud</li>
            <li><strong>Brug præsentationsvisning:</strong> Perfekt til kundemøder - rydelig og professionel</li>
            <li><strong>Fokus på besparelser:</strong> Fremhæv hvor meget kunden sparer over 6 måneder</li>
            <li><strong>Familierabat:</strong> Telenor familierabat er særligt attraktiv for familier</li>
          </ul>

          <h4>Produktviden</h4>
          <ul>
            <li><strong>CBB MIX:</strong> Op til 8 streaming-tjenester for kun 149 kr/md med CBB mobil</li>
            <li><strong>Intro-priser:</strong> Mange abonnementer har 3-6 måneders intro-priser</li>
            <li><strong>EAN-søgning:</strong> Find produkter hurtigt med stregkodescanner eller søgning</li>
            <li><strong>Automatisk løsning:</strong> Lad systemet finde den optimale kombination</li>
          </ul>

          <h4>Performance tips</h4>
          <ul>
            <li>Data gemmes automatisk i browseren</li>
            <li>Brug &quot;Nulstil alt&quot; for at starte frisk med nye kunder</li>
            <li>Systemet husker dine indstillinger mellem sessioner</li>
          </ul>
        </div>
      )
    },

    faq: {
      title: 'Ofte stillede spørgsmål',
      icon: 'helpCircle',
      content: (
        <div className="help-section">
          <h3>Ofte stillede spørgsmål</h3>

          <div className="faq-item">
            <h4>Hvorfor 6 måneder?</h4>
            <p>Vi beregner over 6 måneder fordi mange abonnementer har intro-priser de første 3-6 måneder.
            Dette giver et mere realistisk billede af de langsigtede omkostninger.</p>
          </div>

          <div className="faq-item">
            <h4>Hvad er familierabat?</h4>
            <p>Telenor giver 50 kr/md rabat pr. ekstra linje fra 2. linje. En familie med 4 linjer sparer
            altså (4-1) × 50 kr = 150 kr/md efter rabatperioden.</p>
          </div>

          <div className="faq-item">
            <h4>Hvordan fungerer CBB MIX?</h4>
            <p>CBB MIX giver dig op til 8 streaming-tjenester for kun 149 kr/md, men kræver et CBB mobilabonnement.
            Du kan blande og matche tjenester som Netflix, Disney+, Viaplay osv.</p>
          </div>

          <div className="faq-item">
            <h4>Hvad betyder &quot;provision&quot;?</h4>
            <p>Provision er den fortjeneste du tjener på hvert abonnement. Dette vises automatisk i sammenligningen.</p>
          </div>

          <div className="faq-item">
            <h4>Hvorfor kan jeg ikke finde et bestemt abonnement?</h4>
            <p>Ab abonnementer kan være udløbet eller kun tilgængelige i bestemte perioder.
            Tjek datoerne eller kontakt din leder hvis et abonnement mangler.</p>
          </div>

          <div className="faq-item">
            <h4>Hvad gør kontantrabat?</h4>
            <p>Kontantrabat giver kunden ekstra rabat på hele pakken. Dette trækkes fra den samlede pris
            og justeres automatisk i alle beregninger.</p>
          </div>

          <div className="faq-item">
            <h4>Gemmes mine data?</h4>
            <p>Ja, alle indstillinger gemmes lokalt i din browser. Data deles ikke med andre og
            forsvinder når du nulstiller eller bruger en anden browser.</p>
          </div>
        </div>
      )
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    setActiveSection('introduktion'); // Reset to first section
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-guide-title"
      aria-describedby="help-guide-description"
    >
      <div
        className="modal-content modal-content--large"
        onClick={e => e.stopPropagation()}
      >
        <div className="help-guide">
          {/* Screen reader description */}
          <div id="help-guide-description" className="sr-only">
            Brugervejledning til Power Abo Beregner. Tryk ESC for at lukke.
          </div>

          {/* Header */}
          <div className="help-header">
            <div className="help-title">
              <Icon name="helpCircle" size={24} />
              <h2 id="help-guide-title">Brugervejledning</h2>
            </div>
            <div className="help-close-actions">
              <span className="help-esc-hint" aria-hidden="true">ESC for at lukke</span>
              <button
                onClick={handleClose}
                className="help-close-btn"
                aria-label="Luk hjælp"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="help-nav" aria-label="Hjælp navigation">
            <div className="help-nav-buttons">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`help-nav-btn ${activeSection === key ? 'help-nav-btn--active' : ''}`}
                  aria-current={activeSection === key ? 'page' : undefined}
                >
                  <Icon name={section.icon} size={16} />
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="help-content" role="main">
            {sections[activeSection].content}
          </div>

          {/* Footer */}
          <div className="help-footer">
            <Button onClick={handleClose} variant="outline">
              Luk hjælp
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .help-guide {
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          max-width: 800px;
          width: 100%;
        }

        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--glass-bg);
          margin-bottom: var(--spacing-lg);
        }

        .help-header .help-title {
          flex: 1;
        }

        .help-header .help-close-actions {
          margin-left: auto;
        }

        .help-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .help-title h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: var(--text-xl);
          font-weight: 600;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .help-close-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .help-esc-hint {
          font-size: 12px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .help-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .help-close-btn:hover {
          background: var(--glass-bg);
          color: var(--text-primary);
        }

        .help-nav {
          margin-bottom: var(--spacing-lg);
        }

        .help-nav-buttons {
          display: flex;
          gap: var(--spacing-xs);
          flex-wrap: wrap;
        }

        .help-nav-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--glass-bg);
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: var(--text-sm);
          transition: all 0.2s ease;
        }

        .help-nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
          color: var(--primary);
        }

        .help-nav-btn--active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .help-content {
          flex: 1;
          overflow-y: auto;
          padding-right: var(--spacing-sm);
        }

        .help-section h3 {
          color: var(--text-primary);
          font-size: var(--text-lg);
          margin: 0 0 var(--spacing-md) 0;
        }

        .help-section h4 {
          color: var(--text-primary);
          font-size: var(--text-md);
          margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
          font-weight: 600;
        }

        .help-section p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 var(--spacing-md) 0;
        }

        .help-section ul {
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-md) 0;
          padding-left: var(--spacing-lg);
        }

        .help-section li {
          margin-bottom: var(--spacing-xs);
          line-height: 1.5;
        }

        .help-section strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .help-step {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
        }

        .help-step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: var(--text-sm);
          flex-shrink: 0;
        }

        .help-step-content h4 {
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--text-primary);
          font-size: var(--text-md);
        }

        .help-step-content p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .keyboard-shortcuts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-sm);
          margin: var(--spacing-md) 0;
        }

        .shortcut {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
        }

        .shortcut kbd {
          background: var(--bg);
          border: 1px solid var(--glass-bg);
          border-radius: var(--radius-sm);
          padding: 2px 6px;
          font-size: 12px;
          font-family: monospace;
          color: var(--text-primary);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .shortcut span {
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }

        .faq-item {
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
        }

        .faq-item h4 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-primary);
          font-size: var(--text-md);
          font-weight: 600;
        }

        .faq-item p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .help-footer {
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--glass-bg);
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .help-nav-buttons {
            flex-direction: column;
          }

          .help-step {
            flex-direction: column;
            text-align: center;
          }

          .keyboard-shortcuts {
            grid-template-columns: 1fr;
          }

          .help-guide {
            max-height: 90vh;
            margin: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
}

export default React.memo(HelpGuide);
