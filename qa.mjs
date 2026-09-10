/**
 * Automatisk QA av siden før commit.
 *
 *   npm run build && node qa.mjs
 *
 * Sjekker: horisontal overflow, klipt tekst, at galleriet stacker til én
 * kolonne på mobil, at ankerhopp ikke gjemmer overskrifter bak toppmenyen,
 * og at klikkflater holder WCAG 2.2 sitt minstemål på 24px.
 */
import { chromium } from "playwright";
import { startServer } from "./server-hjelper.mjs";

const SEKSJONER = ["hero", "om", "priser", "galleri", "kontakt"];

const feil = [];
const meld = (ok, tekst) => {
  console.log(`${ok ? "  ok  " : " FEIL "} ${tekst}`);
  if (!ok) feil.push(tekst);
};

const { url: BASE, stopp } = await startServer();

try {
  const nettleser = await chromium.launch();

  for (const visning of [
    { navn: "desktop", width: 1440, height: 900 },
    { navn: "mobil", width: 400, height: 850 },
  ]) {
    console.log(`\n── ${visning.navn} (${visning.width}px) ──`);
    const kontekst = await nettleser.newContext({
      viewport: { width: visning.width, height: visning.height },
      locale: "nb-NO",
    });
    const side = await kontekst.newPage();
    await side.goto(BASE, { waitUntil: "networkidle" });
    await side.evaluate(() => document.fonts.ready);

    // 1. Ingen horisontal scroll
    const overflow = await side.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    meld(overflow <= 0, `ingen horisontal scroll (overskudd: ${overflow}px)`);

    // 2. Ingen elementer som stikker ut av viewporten
    const utenfor = await side.evaluate((bredde) => {
      // Et element som stikker ut er bare et problem hvis det faktisk er
      // synlig utenfor kanten. Dekor inne i en overflow-hidden-forelder
      // blir klippet av nettleseren og teller ikke.
      const klippesAvForelder = (el) => {
        for (let f = el.parentElement; f && f !== document.body; f = f.parentElement) {
          const s = getComputedStyle(f);
          if (s.overflowX !== "visible" || s.overflow !== "visible") return true;
        }
        return false;
      };
      const treff = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || klippesAvForelder(el)) continue;
        if (r.right > bredde + 1 || r.left < -1) {
          treff.push(`${el.tagName.toLowerCase()}.${el.className}`.slice(0, 70));
        }
      }
      return treff.slice(0, 5);
    }, visning.width);
    meld(utenfor.length === 0, `ingenting stikker utenfor kanten ${utenfor.length ? "→ " + utenfor.join(", ") : ""}`);

    // 3. Ingen klipt tekst (scrollHeight større enn boksen)
    const klipt = await side.evaluate(() => {
      const treff = [];
      // sr-only-elementer er 1x1 med vilje og skal ikke telle som klipt.
      const erSkjermleserTekst = (el) => el.closest(".sr-only") !== null;
      for (const el of document.querySelectorAll(
        "h1,h2,h3,p,dt,dd,a,span,li,address",
      )) {
        if (!el.textContent?.trim() || erSkjermleserTekst(el)) continue;
        const s = getComputedStyle(el);
        if (s.overflow === "visible" && s.overflowY === "visible") continue;
        if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) {
          treff.push(el.textContent.trim().slice(0, 40));
        }
      }
      return treff.slice(0, 5);
    });
    meld(klipt.length === 0, `ingen klipt tekst ${klipt.length ? "→ " + klipt.join(" | ") : ""}`);

    // 4. Galleri-grid: én kolonne på mobil, flere på desktop
    const kolonner = await side.evaluate(() => {
      const grid = document.querySelector("#galleri ul");
      return getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    });
    meld(
      visning.width < 640 ? kolonner === 1 : kolonner > 1,
      `galleriet har ${kolonner} kolonne(r)`,
    );

    // 5. Ankerhopp: overskriften må ligge under den faste toppmenyen
    const hoyde = await side.evaluate(
      () => document.querySelector("header").getBoundingClientRect().height,
    );
    // Slår av smooth-scroll, ellers måler vi midt i animasjonen.
    await side.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });

    for (const id of SEKSJONER.slice(1)) {
      await side.evaluate(() => window.scrollTo(0, 0));
      await side.evaluate((s) => {
        location.hash = "";
        location.hash = `#${s}`;
      }, id);
      // Vi måler toppen av selve seksjonen, ikke h2-en: h2 ligger 80px inn
      // i seksjonens egen padding, og sier derfor ingenting om menyen.
      const { seksjonTopp, bunnAvSide } = await side.evaluate((s) => {
        const sek = document.querySelector(`#${s}`);
        return {
          seksjonTopp: Math.round(sek.getBoundingClientRect().top),
          bunnAvSide:
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight - 2,
        };
      }, id);

      // scroll-padding-top er 5rem (80px), menyen er ~61px. Seksjonen skal
      // lande på 80px — altså klar av menyen, ikke gjemt bak den.
      const traff = bunnAvSide ? seksjonTopp >= hoyde : seksjonTopp >= hoyde && seksjonTopp <= 100;
      meld(
        traff,
        `#${id}: seksjonen lander ${seksjonTopp}px fra toppen, klar av ${Math.round(hoyde)}px meny${bunnAvSide ? " (nederst på siden)" : ""}`,
      );
    }

    await side.evaluate(() => {
      location.hash = "";
      window.scrollTo(0, 0);
    });

    // 6. WCAG 2.2 klikkflate: minst 24x24 CSS-piksler
    const forSma = await side.evaluate(() => {
      const treff = [];
      for (const el of document.querySelectorAll("a[href], button")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (el.classList.contains("sr-only")) continue; // måles i fokus-testen
        if (r.width < 24 || r.height < 24) {
          treff.push(`${el.textContent.trim().slice(0, 25)} (${Math.round(r.width)}x${Math.round(r.height)})`);
        }
      }
      return treff;
    });
    meld(forSma.length === 0, `alle klikkflater er minst 24x24px ${forSma.length ? "→ " + forSma.join(", ") : ""}`);

    // 7b. Hopp-lenka skal bli synlig og klikkbar når den får fokus.
    // Ankerhoppene over har flyttet fokus, så vi må laste siden på nytt
    // for at det første Tab-trykket skal treffe hopp-lenka.
    await side.goto(BASE, { waitUntil: "networkidle" });
    await side.keyboard.press("Tab");
    const hopp = await side.evaluate(() => {
      const a = document.activeElement;
      const r = a.getBoundingClientRect();
      return { tekst: a.textContent.trim(), b: r.width, h: r.height };
    });
    meld(
      hopp.tekst === "Hopp til innholdet" && hopp.b >= 24 && hopp.h >= 24,
      `hopp-lenka blir ${Math.round(hopp.b)}x${Math.round(hopp.h)}px ved fokus`,
    );

    // 8. Telefonlenkene peker riktig
    const tel = await side.evaluate(() =>
      [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute("href")),
    );
    meld(
      tel.length >= 2 && tel.every((h) => h === "tel:+4741217974"),
      `${tel.length} tel-lenker, alle til +4741217974`,
    );

    await kontekst.close();
  }
  await nettleser.close();
} catch (e) {
  console.error(e);
  feil.push(String(e));
} finally {
  await stopp();
}

console.log(
  feil.length === 0
    ? "\n✓ QA gikk gjennom uten feil."
    : `\n✗ ${feil.length} feil:\n` + feil.map((f) => `  - ${f}`).join("\n"),
);
process.exit(feil.length === 0 ? 0 : 1);
