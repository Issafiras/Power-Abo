/**
 * Footer komponent
 * Viser copyright og privatlivsoplysninger
 */

export default function Footer() {
  return (
    <footer className="app-footer fade-in-up delay-200">
      <div className="container app-footer__content">
        <div className="app-footer__text">
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
    </footer>
  );
}
