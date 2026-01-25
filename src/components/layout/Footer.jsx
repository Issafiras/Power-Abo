/**
 * Footer komponent
 * Viser copyright og privatlivsoplysninger
 */

import React from 'react';
import { CURRENT_VERSION } from '../../constants/changelog';

function Footer({ onVersionClick }) {
  return (
    <footer className="app-footer fade-in-up delay-200" role="contentinfo">
      <div className="container app-footer__content">
        <div className="app-footer__text">
          <p className="app-footer__copyright">
            © 2025 Issa Firas. Alle rettigheder forbeholdes. v{CURRENT_VERSION}
          </p>
          <p className="app-footer__purpose">
            Udviklet til POWER butik – kun til internt brug.
          </p>
          <div className="app-footer__privacy">
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
    </footer>
  );
}

export default React.memo(Footer);
