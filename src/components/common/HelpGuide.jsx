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
          <h3>Velkommen til Power Abo Beregner 2.1</h3>
          <p>
            Dette værktøj hjælper dig med at levere den bedste rådgivning på rekordtid.
            Nu med indbygget hardware-beregning, RePOWER-indbytning og QR-deling.
          </p>

          <h4>Nye funktioner i v2.1:</h4>
          <ul>
            <li><strong>RePOWER Indbytning:</strong> Træk kundens gamle enhed fra prisen med det samme.</li>
            <li><strong>Effektiv Hardware Pris:</strong> Vis hvad telefonen <em>reelt</em> koster efter besparelser.</li>
            <li><strong>QR Deling:</strong> Send hele beregningen til kundens telefon med ét klik.</li>
            <li><strong>Lynhurtig:</strong> Ingen ventetid på backend - alt kører lokalt.</li>
          </ul>
        </div>
      )
    },

    komigang: {
      title: 'Hurtig guide',
      icon: 'rocket',
      content: (
        <div className="help-section">
          <h3>Sådan lukker du salget på 30 sekunder</h3>

          <div className="help-step">
            <div className="help-step-number">1</div>
            <div className="help-step-content">
              <h4>Scan eller søg produktet</h4>
              <p>Start med at scanne varen (EAN) eller søg. Det sætter den "Effektive Hardware Pris" som anker for samtalen.</p>
            </div>
          </div>

          <div className="help-step">
            <div className="help-step-number">2</div>
            <div className="help-step-content">
              <h4>Indtast kundens tal</h4>
              <p>Spørg: <em>"Hvad giver du i dag?"</em> og indtast beløbet. Indtast evt. RePOWER-værdi hvis de har en bytte-enhed.</p>
            </div>
          </div>

          <div className="help-step">
            <div className="help-step-number">3</div>
            <div className="help-step-content">
              <h4>Find den perfekte pakke</h4>
              <p>Fold pakkevælgeren ud og klik på de abonnementer der matcher. Vis hvordan besparelsen æder prisen på telefonen.</p>
            </div>
          </div>

          <div className="help-step">
            <div className="help-step-number">4</div>
            <div className="help-step-content">
              <h4>Del tilbuddet</h4>
              <p>Tryk på "Del" ikonet i toppen og lad kunden scanne QR-koden, så de har beregningen med hjem.</p>
            </div>
          </div>
        </div>
      )
    },

    detaljeret: {
      title: 'Funktioner',
      icon: 'book',
      content: (
        <div className="help-section">
          <h3>Dybdegående gennemgang</h3>

          <h4>Effektiv Hardware Pris</h4>
          <p>
            Dette er din "closer". Systemet tager varens pris og trækker 6 måneders abonnements-besparelse samt evt. RePOWER-værdi fra.
            Det tal der står tilbage, er den "reelle" pris kunden betaler for hardwaren.
          </p>

          <h4>RePOWER Indbytning</h4>
          <p>
            Indtast værdien fra RePOWER-vurderingen i feltet under varens pris. Dette beløb trækkes fra totalprisen som en engangsrabat
            og indgår i beregningen af den effektive hardware pris.
          </p>

          <h4>Streaming (CBB MIX)</h4>
          <ul>
            <li>Vælg 2+ tjenester for at aktivere CBB MIX priser.</li>
            <li>Systemet holder automatisk styr på, om kunden sparer penge ved at samle det.</li>
          </ul>

          <h4>Familierabat (Telenor)</h4>
          <p>
            Tilføj flere Telenor-abonnementer til kurven. Systemet trækker automatisk 50 kr./md. fra linje 2, 3, 4 osv.
          </p>
        </div>
      )
    },

    genveje: {
      title: 'Genveje',
      icon: 'zap',
      content: (
        <div className="help-section">
          <h3>Bliv en Power-User</h3>
          <p>Spar tid med disse tastaturgenveje:</p>

          <div className="keyboard-shortcuts">
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>R</kbd>
              <span>Nulstil alt (Ny kunde)</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>P</kbd>
              <span>Præsentationsvisning</span>
            </div>
            <div className="shortcut">
              <kbd>F8</kbd>
              <span>Vis/Skjul indtjening</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>T</kbd>
              <span>Skift tema (Lys/Mørk)</span>
            </div>
            <div className="shortcut">
              <kbd>Esc</kbd>
              <span>Luk vinduer</span>
            </div>
          </div>
        </div>
      )
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    setActiveSection('introduktion');
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-guide-title"
    >
      <div
        className="modal-content modal-content--large"
        onClick={e => e.stopPropagation()}
      >
        <div className="help-guide">
          <div id="help-guide-description" className="sr-only">
            Brugervejledning til Power Abo Beregner.
          </div>

          <div className="help-header">
            <div className="help-title">
              <Icon name="helpCircle" size={24} />
              <h2 id="help-guide-title">Brugervejledning</h2>
            </div>
            <div className="help-close-actions">
              <button
                onClick={handleClose}
                className="help-close-btn"
                aria-label="Luk hjælp"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
          </div>

          <nav className="help-nav">
            <div className="help-nav-buttons">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`help-nav-btn ${activeSection === key ? 'help-nav-btn--active' : ''}`}
                >
                  <Icon name={section.icon} size={16} />
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="help-content">
            {sections[activeSection].content}
          </div>

          <div className="help-footer">
            <Button onClick={handleClose} variant="secondary">
              Luk
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .help-guide {
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          width: 100%;
        }

        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: var(--spacing-lg);
        }

        .help-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .help-title h2 {
          margin: 0;
          font-size: var(--font-xl);
        }

        .help-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          transition: color 0.2s;
        }

        .help-close-btn:hover {
          color: var(--text-primary);
        }

        .help-nav {
          margin-bottom: var(--spacing-lg);
        }

        .help-nav-buttons {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .help-nav-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: var(--font-sm);
          transition: all 0.2s;
        }

        .help-nav-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .help-nav-btn--active {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .help-content {
          overflow-y: auto;
          padding-right: var(--spacing-sm);
          flex: 1;
        }

        .help-section h3 {
          margin-top: 0;
          color: var(--text-primary);
        }

        .help-section h4 {
          margin: var(--spacing-lg) 0 var(--spacing-xs);
          color: var(--text-primary);
          font-size: var(--font-base);
        }

        .help-section p, .help-section ul {
          color: var(--text-secondary);
          font-size: var(--font-sm);
          line-height: 1.6;
        }

        .help-section ul {
          padding-left: var(--spacing-lg);
        }

        .help-section li {
          margin-bottom: var(--spacing-xs);
        }

        .help-step {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-app);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
        }

        .help-step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: var(--font-sm);
          flex-shrink: 0;
        }

        .help-step-content h4 {
          margin-top: 0;
        }

        .keyboard-shortcuts {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--spacing-md);
        }

        .shortcut {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-app);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
        }

        kbd {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 12px;
          box-shadow: 0 1px 0 var(--border-color);
        }

        .help-footer {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}

export default React.memo(HelpGuide);