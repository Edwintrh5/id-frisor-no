/**
 * Skjermbilder av siden på desktop og mobil.
 *
 *   npm run build && node screenshot.mjs
 *
 * Bildene havner i skjermbilder/. Mappa er i .gitignore.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { startServer } from "./server-hjelper.mjs";

const UTMAPPE = "skjermbilder";

const VISNINGER = [
  { navn: "desktop", width: 1440, height: 900 },
  { navn: "mobil", width: 400, height: 850 },
];

const { url: BASE, stopp } = await startServer();

let avsluttKode = 0;
try {
  await mkdir(UTMAPPE, { recursive: true });

  const nettleser = await chromium.launch();
  for (const visning of VISNINGER) {
    const kontekst = await nettleser.newContext({
      viewport: { width: visning.width, height: visning.height },
      deviceScaleFactor: 2,
      locale: "nb-NO",
    });
    const side = await kontekst.newPage();
    await side.goto(BASE, { waitUntil: "networkidle" });
    // Lar fontene laste ferdig, ellers får vi et blaff av fallback-fonten.
    await side.evaluate(() => document.fonts.ready);

    await side.screenshot({
      path: `${UTMAPPE}/${visning.navn}-hel.png`,
      fullPage: true,
    });

    // Toppmenyen er sticky og ville lagt seg over seksjonene i utsnittene.
    await side.addStyleTag({ content: "header { visibility: hidden; }" });

    for (const id of ["hero", "om", "priser", "galleri", "kontakt"]) {
      const seksjon = side.locator(`#${id}`);
      await seksjon.scrollIntoViewIfNeeded();
      await seksjon.screenshot({ path: `${UTMAPPE}/${visning.navn}-${id}.png` });
    }

    console.log(`✓ ${visning.navn} (${visning.width}px)`);
    await kontekst.close();
  }
  await nettleser.close();
  console.log(`\nSkjermbilder ligger i ${UTMAPPE}/`);
} catch (feil) {
  console.error(feil);
  avsluttKode = 1;
} finally {
  await stopp();
}

process.exit(avsluttKode);
