/**
 * Priser for I.D Frisør.
 *
 * REDIGER HER — ingen komponentkode trenger å endres.
 *
 * Når de nye prisene er klare:
 *   1. Rett opp tallene i `grupper` under.
 *   2. Sett `forelopig` til false.
 * Da forsvinner "Foreløpige priser"-merket fra siden av seg selv.
 */

export type Prislinje = {
  /** Navn på behandlingen, slik det skal stå på siden. */
  navn: string;
  /** Pris som tekst, f.eks. "550", "550–650" eller "fra 390". */
  pris: string;
  /** Valgfri utdypning som vises i mindre skrift under navnet. */
  merknad?: string;
};

export type Prisgruppe = {
  tittel: string;
  linjer: Prislinje[];
};

/**
 * Settes til false når de endelige prisene er lagt inn.
 * Styrer badge-elementet i prisseksjonen.
 */
export const forelopig = true;

/** Vises bare når `forelopig` er true. */
export const forelopigTekst =
  "Foreløpige priser — hentet fra dagens nettside. Nye priser kommer.";

/** Står nederst i prisseksjonen uansett. */
export const prisfotnote = "Alle fargepriser er veiledende.";

export const grupper: Prisgruppe[] = [
  {
    tittel: "Klipp",
    linjer: [
      {
        navn: "Senior frisør",
        pris: "550–650",
        merknad: "Inkludert vask og lett styling — 45 minutter",
      },
      {
        navn: "Junior frisør",
        pris: "550",
        merknad: "Inkludert vask og lett styling — 45 minutter",
      },
      { navn: "Barneklipp", pris: "fra 390", merknad: "Inntil 12 år" },
    ],
  },
  {
    tittel: "Balayage",
    linjer: [
      { navn: "Balayage", pris: "fra 1300–1600" },
      { navn: "Foilayage", pris: "fra 1500" },
      { navn: "Toner", pris: "fra 490" },
    ],
  },
  {
    tittel: "Farge",
    linjer: [
      { navn: "Farge ettervekst", pris: "fra 950" },
      { navn: "Helfarge", pris: "fra 950–1500" },
    ],
  },
  {
    tittel: "Striper",
    linjer: [
      { navn: "Foliestriper", pris: "fra 1500" },
      { navn: "Toner", pris: "fra 490" },
    ],
  },
];
