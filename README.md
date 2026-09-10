# I.D Frisør — nettside

Statisk side bygget med Astro, TypeScript og Tailwind CSS. Erstatter
Squarespace-siden på samme domene.

## Kom i gang

```bash
npm install
npm run dev      # http://localhost:4321
```

| Kommando        | Hva den gjør                                        |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Utviklingsserver med hot reload                     |
| `npm run build` | Bygger den ferdige siden til `dist/`                |
| `npm run qa`    | Kjører QA-sjekkene (krever `npm run build` først)   |
| `npm run shots` | Skjermbilder på desktop og mobil til `skjermbilder/` |
| `npm run check` | Typesjekk                                           |

## Endre innhold uten å røre kode

Tre steder dekker det meste. Ingen komponentkode trenger å endres.

### Priser — `src/data/priser.ts`

Rett tallene i `grupper`. Når de endelige prisene er inne, sett
`forelopig = false`, så forsvinner "Foreløpige priser"-merket fra siden
av seg selv.

### Åpningstider og kontaktinfo — `src/data/kontakt.ts`

Sett `tider` på hver dag, for eksempel `{ dag: "Mandag", tider: "10–18" }`.
Dager som står som `null` vises som *oppdateres* på siden.

### Galleribilder — `src/content/galleri/`

Legg bildefiler rett i mappa. Hvert bilde tar plassen til ett
"Bilde kommer"-kort ved neste bygg. Se `src/content/galleri/LES-MEG.md`.

### Farger og fonter — `src/styles/global.css`

Alle designtokens ligger i `@theme`-blokken øverst. Endrer du en verdi
der, slår den gjennom overalt. Ingen komponent inneholder hardkodede
fargeverdier.

## QA før du pusher

```bash
npm run build && npm run qa && npm run shots
```

`qa.mjs` sjekker horisontal scroll, klipt tekst, at galleriet stacker til
én kolonne på mobil, at ankerhopp ikke gjemmer innhold bak toppmenyen, og
at klikkflater holder WCAG 2.2 sitt minstemål på 24px.

Fargekontrastene er regnet ut mot WCAG AA for alle tokenpar som brukes,
inkludert gjennomsiktighetsnivåene. Laveste måling er 4.78:1 mot et krav
på 4.5:1.

## Publisering

Statisk bygg. Vercel kjenner igjen Astro av seg selv — ingen adapter er
nødvendig. Byggkommando `npm run build`, utmappe `dist`.
