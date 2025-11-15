/**
 * Guide komponent
 * Komplet brugerguide for Power Abo Beregner
 */

import React from 'react';
import Icon from './common/Icon';
import COPY from '../constants/copy';

function Guide({ onClose }) {
  const steps = [
    {
      id: 1,
      title: 'Indtast kundens situation',
      icon: 'chart',
      description: 'Start med at indtaste kundens nuværende situation',
      details: [
        'Indtast antal mobilabonnementer kunden har',
        'Angiv kundens nuværende månedlige mobiludgifter (total for alle abonnementer)',
        'Vælg hvilke streaming-tjenester kunden allerede har (Netflix, Disney+, Viaplay, osv.)',
        'Hvis kunden har eksisterende abonnementer hos Telmore, Telenor eller CBB, marker disse',
        'Indtast varens pris inden rabat (hvis relevant)'
      ]
    },
    {
      id: 2,
      title: 'Søg efter produkter (valgfrit)',
      icon: 'search',
      description: 'Brug EAN-søgning til at finde priser på produkter',
      details: [
        'Indtast produktnavn, mærke eller EAN-kode i søgefeltet',
        'På mobil kan du bruge kameraet til at scanne stregkoder',
        'Systemet finder automatisk prisen fra Power.dk',
        'Prisen bruges til at beregne den samlede besparelse'
      ]
    },
    {
      id: 3,
      title: 'Find den bedste løsning',
      icon: 'sparkles',
      description: 'Lad systemet finde den optimale løsning automatisk',
      details: [
        'Klik på "Se min besparelse" knappen',
        'Systemet analyserer alle tilgængelige abonnementer',
        'Den bedste kombination vælges automatisk baseret på kundens behov',
        'Løsningen inkluderer streaming-tjenester hvor muligt'
      ]
    },
    {
      id: 4,
      title: 'Vælg operatør og abonnementer',
      icon: 'smartphone',
      description: 'Gennemse og vælg abonnementer manuelt hvis du foretrækker det',
      details: [
        'Vælg en operatør fra fanerne: Telmore, Telenor, CBB eller Bredbånd',
        'Brug søgefeltet til at finde specifikke abonnementer',
        'Klik på "Vælg denne pakke" for at tilføje abonnementet til kurven',
        'Du kan tilføje flere abonnementer til kurven'
      ]
    },
    {
      id: 5,
      title: 'Tilpas løsningen',
      icon: 'settings',
      description: 'Justér indstillinger for at optimere løsningen',
      details: [
        'Kontant rabat: Justér rabatten for at se forskellige scenarier',
        'Auto-justér: Aktiver for automatisk optimering af rabat',
        'Gratis oprettelse: Marker hvis kunden får gratis oprettelse',
        'CBB MIX: Vælg antal streaming-tjenester i CBB MIX pakken'
      ]
    },
    {
      id: 6,
      title: 'Se sammenligningen',
      icon: 'trendingDown',
      description: 'Gennemgå den detaljerede sammenligning',
      details: [
        'Se kundens nuværende omkostninger vs. vores tilbud',
        'Besparelse over 6 måneder vises tydeligt',
        'Mersalg og indtjening kan vises med F8-tasten',
        'Se hvilke streaming-tjenester der er inkluderet i løsningen'
      ]
    },
    {
      id: 7,
      title: 'Præsenter løsningen',
      icon: 'presentation',
      description: 'Brug præsentationsmode til at vise løsningen til kunden',
      details: [
        'Klik på "Præsentér" i headeren eller tryk Ctrl+P',
        'Præsentationsmode viser løsningen i fuldskærm',
        'Brug "Print" til at generere en PDF af tilbuddet',
        'Tryk ESC eller "Næste kunde" for at lukke'
      ]
    }
  ];

  const tips = [
    {
      icon: 'zap',
      text: 'Alle data gemmes automatisk - du kan altid fortsætte hvor du slap'
    },
    {
      icon: 'info',
      text: 'Brug keyboard shortcuts: Ctrl+R (reset), Ctrl+P (præsentation), Ctrl+T (tema), F8 (indtjening), ? eller H (guide)'
    },
    {
      icon: 'rocket',
      text: 'Brug "Se min besparelse" for hurtigst mulig løsning - systemet finder den bedste kombination automatisk'
    },
    {
      icon: 'helpCircle',
      text: 'Hover over ikoner og labels for at se tooltips med ekstra information'
    }
  ];

  return (
    <div className="guide-container">
      <div className="guide-header">
        <div className="guide-header-content">
          <Icon name="book" size={32} className="guide-header-icon" />
          <div>
            <h2 className="guide-title">Komplet Brugerguide</h2>
            <p className="guide-subtitle">Lær hvordan du bruger Power Abo Beregner</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="guide-close-btn"
          aria-label="Luk guide"
        >
          <Icon name="x" size={24} />
        </button>
      </div>

      <div className="guide-content">
        <div className="guide-intro">
          <p className="guide-intro-text">
            Power Abo Beregner hjælper dig med at finde den bedste løsning for dine kunder ved at sammenligne 
            mobilabonnementer, streaming-tjenester og beregne besparelser. Følg disse trin for at få mest muligt ud af værktøjet.
          </p>
        </div>

        <div className="guide-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className="guide-step"
            >
              <div className="guide-step-header">
                <div className="guide-step-number">
                  <span className="guide-step-number-text">{step.id}</span>
                </div>
                <div className="guide-step-icon-wrapper">
                  <Icon name={step.icon} size={24} className="guide-step-icon" />
                </div>
                <div className="guide-step-title-wrapper">
                  <h3 className="guide-step-title">{step.title}</h3>
                  <p className="guide-step-description">{step.description}</p>
                </div>
              </div>
              <ul className="guide-step-details">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="guide-step-detail">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="guide-tips">
          <h3 className="guide-tips-title">
            <Icon name="star" size={20} style={{ marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
            Pro Tips
          </h3>
          <div className="guide-tips-grid">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="guide-tip"
              >
                <Icon name={tip.icon} size={20} className="guide-tip-icon" />
                <p className="guide-tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .guide-container {
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
          box-shadow: 
            0 24px 64px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 2px solid var(--glass-border-strong);
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
        }

        .guide-header {
          padding: var(--spacing-2xl);
          border-bottom: 2px solid var(--glass-border-strong);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, 
            rgba(255, 109, 31, 0.15) 0%, 
            rgba(255, 109, 31, 0.08) 100%
          );
          box-shadow: 
            0 4px 16px rgba(255, 109, 31, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .guide-header-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .guide-header-icon {
          color: var(--color-orange);
        }

        .guide-title {
          font-size: var(--font-2xl);
          font-weight: var(--font-extrabold);
          margin: 0;
          color: var(--text-primary);
          letter-spacing: var(--letter-spacing-tight);
          line-height: var(--leading-tight);
        }

        .guide-subtitle {
          font-size: var(--font-base);
          color: var(--text-secondary);
          margin: var(--spacing-xs) 0 0 0;
        }

        .guide-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          width: 40px;
          height: 40px;
        }

        .guide-close-btn:hover {
          background: rgba(255, 109, 31, 0.2);
          border-color: rgba(255, 109, 31, 0.4);
          color: var(--color-orange);
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 109, 31, 0.3);
        }

        .guide-close-btn:active {
          transform: rotate(90deg) scale(0.95);
        }

        .guide-content {
          padding: var(--spacing-xl);
          overflow-y: auto;
          flex: 1;
        }

        .guide-intro {
          margin-bottom: var(--spacing-2xl);
          padding: var(--spacing-lg);
          background: rgba(255, 109, 31, 0.05);
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--color-orange);
        }

        .guide-intro-text {
          margin: 0;
          font-size: var(--font-base);
          line-height: 1.7;
          color: var(--text-primary);
        }

        .guide-steps {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .guide-step {
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          border: 2px solid rgba(255, 255, 255, 0.08);
          transition: all var(--transition-base);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .guide-step:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 109, 31, 0.4);
          transform: translateX(6px) translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(255, 109, 31, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .guide-step-header {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .guide-step-number {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-orange), var(--color-orange-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 
            0 4px 16px rgba(255, 109, 31, 0.4),
            0 0 0 0 rgba(255, 109, 31, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all var(--transition-base);
        }

        .guide-step:hover .guide-step-number {
          box-shadow: 
            0 6px 24px rgba(255, 109, 31, 0.6),
            0 0 0 4px rgba(255, 109, 31, 0.2);
          transform: scale(1.1);
        }

        .guide-step-number-text {
          font-size: var(--font-lg);
          font-weight: var(--font-extrabold);
          color: white;
        }

        .guide-step-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: rgba(255, 109, 31, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .guide-step-icon {
          color: var(--color-orange);
        }

        .guide-step-title-wrapper {
          flex: 1;
        }

        .guide-step-title {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--text-primary);
          letter-spacing: var(--letter-spacing-tight);
          line-height: var(--leading-tight);
        }

        .guide-step-description {
          font-size: var(--font-base);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .guide-step-details {
          list-style: none;
          padding: 0;
          margin: 0;
          padding-left: var(--spacing-lg);
        }

        .guide-step-detail {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: var(--spacing-sm);
          position: relative;
          padding-left: var(--spacing-md);
        }

        .guide-step-detail::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--color-orange);
          font-weight: var(--font-bold);
        }

        .guide-step-detail:last-child {
          margin-bottom: 0;
        }

        .guide-tips {
          margin-top: var(--spacing-2xl);
          padding-top: var(--spacing-xl);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .guide-tips-title {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--text-primary);
          display: flex;
          align-items: center;
        }

        .guide-tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .guide-tip {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          border: 2px solid rgba(255, 255, 255, 0.08);
          transition: all var(--transition-base);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .guide-tip:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 109, 31, 0.3);
          transform: translateY(-3px);
          box-shadow: 
            0 6px 20px rgba(255, 109, 31, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .guide-tip-icon {
          color: var(--color-orange);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .guide-tip-text {
          margin: 0;
          font-size: var(--font-sm);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .guide-container {
            max-height: 95vh;
            border-radius: var(--radius-lg);
          }

          .guide-header {
            padding: var(--spacing-lg);
          }

          .guide-content {
            padding: var(--spacing-lg);
          }

          .guide-step-header {
            flex-wrap: wrap;
          }

          .guide-tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Guide;

