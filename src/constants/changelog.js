/**
 * Changelog data
 * Holder styr på versioner og nye features
 */

export const CURRENT_VERSION = '2.2.0';

export const CHANGELOG = [
  {
    version: '2.2.0',
    date: 'Januar 2026',
    title: 'Performance & UI Update',
    features: [
      {
        icon: 'zap',
        title: 'TypeScript Motor',
        description: 'Hele beregningsmotoren er nu drevet af TypeScript for 100% præcision og stabilitet.'
      },
      {
        icon: 'play',
        title: 'Flydende Animationer',
        description: 'Framer Motion er tilføjet for at give en mere levende oplevelse med animerede grafer og interaktive kort.'
      },
      {
        icon: 'smartphone',
        title: 'Mobil Optimering',
        description: 'Ny sticky bund-bar og responsive tabeller gør appen perfekt til tablets og telefoner.'
      }
    ]
  },
  {
    version: '2.1.0',
    date: 'Januar 2026',
    title: 'Hardware & Deling Update',
    features: [
      {
        icon: 'refresh',
        title: 'RePOWER Indbytning',
        description: 'Medregn værdien af kundens gamle enhed direkte i beregningen. Beløbet trækkes fra hardwareprisen her og nu.'
      },
      {
        icon: 'share',
        title: 'Del via QR-kode',
        description: 'Generer en QR-kode som kunden kan scanne. Hele beregningen åbner direkte på deres egen telefon.'
      },
      {
        icon: 'tag',
        title: 'Effektiv Hardware Pris',
        description: 'Vis kunden hvad deres nye enhed "faktisk" koster, når man modregner besparelsen på abonnementet.'
      },
      {
        icon: 'chevronDown',
        title: 'Kollapsbar Pakkevælger',
        description: 'Sektionen "Find din perfekte pakke" er nu kollapset som standard for at give et bedre overblik over kundens situation.'
      },
      {
        icon: 'zap',
        title: 'Lynhurtig & Lokal',
        description: 'Vi har fjernet tunge backend-afhængigheder. Appen kører nu 100% lokalt og loader øjeblikkeligt.'
      }
    ]
  }
];
