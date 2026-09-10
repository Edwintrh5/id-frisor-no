/**
 * Kontaktinformasjon og åpningstider for I.D Frisør.
 *
 * REDIGER HER — ingen komponentkode trenger å endres.
 *
 * Åpningstider: sett `tider` til en tekst ("10–18", "Stengt", "10–15").
 * Lar du `tider` stå som null, viser siden "oppdateres" for den dagen.
 */

export const salong = {
  navn: "I.D Frisør",
  gate: "Vår Frue Strete 3",
  postnummer: "7013",
  poststed: "Trondheim",
  /** Vises som lenketekst. */
  telefonVist: "412 17 974",
  /** Brukes i tel:-lenker. Må være på internasjonalt format. */
  telefonLenke: "+4741217974",
  /** Vanlig lenke til Google Maps-søk, ikke et innebygd kart. */
  kartlenke:
    "https://www.google.com/maps/search/?api=1&query=I.D+Fris%C3%B8r+V%C3%A5r+Frue+Strete+3+7013+Trondheim",
  naerhet: "Rett bak Vår Frue kirke, midt i Trondheim sentrum.",
};

export type Apningsdag = {
  dag: string;
  /** null betyr at tiden ikke er bekreftet ennå. */
  tider: string | null;
};

export const apningstider: Apningsdag[] = [
  { dag: "Mandag", tider: null },
  { dag: "Tirsdag", tider: null },
  { dag: "Onsdag", tider: null },
  { dag: "Torsdag", tider: null },
  { dag: "Fredag", tider: null },
  { dag: "Lørdag", tider: null },
  { dag: "Søndag", tider: null },
];

/** Vises under åpningstidene når minst én dag mangler tider. */
export const apningstiderMerknad =
  "Åpningstidene er ikke bekreftet ennå. Ring oss, så tar vi det på telefon.";
