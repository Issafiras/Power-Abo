/**
 * Footer komponent
 * Viser copyright og privatlivsoplysninger
 */

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-text">
            <p>© 2025 Issa Firas. Alle rettigheder forbeholdes.</p>
            <p>Udviklet til POWER butik – kun til internt brug.</p>
            <p>
              Værktøjet gemmer kun lokale data i din browser (LocalStorage). 
              Ingen personlige oplysninger deles eller sendes til POWER eller tredjepart. 
              Oplysninger slettes automatisk når du nulstiller.
            </p>
            <p>
              For yderligere information om, hvordan POWER håndterer personoplysninger, 
              henvises til vores privatlivspolitik.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-xl));
          border-top: 1px solid var(--glass-border);
          padding: var(--spacing-lg) 0;
          margin-top: auto;
        }

        .footer-content {
          text-align: center;
        }

        .footer-text {
          color: var(--text-muted);
          font-size: var(--font-sm);
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
        }

        .footer-text p {
          margin: 0 0 var(--spacing-sm) 0;
        }

        .footer-text p:last-child {
          margin-bottom: 0;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            var(--color-orange), 
            var(--color-telenor),
            var(--color-cbb),
            var(--color-orange)
          );
          background-size: 200% 100%;
          animation: gradientFlow 3s ease infinite;
          opacity: 0.6;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }

        @media (max-width: 900px) {
          .footer {
            padding: var(--spacing-md) 0;
          }

          .footer-text {
            font-size: var(--font-xs);
            padding: 0 var(--spacing-sm);
          }
        }
      `}</style>
    </footer>
  );
}
