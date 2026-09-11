# Domenebytte — idfrisor.com

Status per 11. september 2026: domenet er under overføring fra
Squarespace Domains til Domeneshop (`pendingTransfer`).

## Dagens oppsett — rullback-referanse

Skriv dette av før du rører noe. Trenger du å sette siden tilbake til
Squarespace, er det disse postene som skal inn igjen.

| Type | Navn | Verdi | TTL |
| --- | --- | --- | --- |
| NS | @ | dns1.p08.nsone.net | — |
| NS | @ | dns2.p08.nsone.net | — |
| NS | @ | dns3.p08.nsone.net | — |
| NS | @ | dns4.p08.nsone.net | — |
| A | @ | 198.185.159.144 |  |
| A | @ | 198.185.159.145 |  |
| A | @ | 198.49.23.144 |  |
| A | @ | 198.49.23.145 |  |
| CNAME | www | ext-sq.squarespace.com | — |

**MX: ingen.** Bekreftet autoritativt mot NS1 og mot tre uavhengige
resolvere. Det betyr at ingen e-post går på domenet, og at et DNS-bytte
ikke kan slå ut e-post. **TXT: ingen.**

DNS ligger i dag hos NS1 (nsone.net), som er Squarespace sin
DNS-leverandør — ikke hos registraren. Det er verdt å merke seg: når
overføringen lander hos Domeneshop, setter de gjerne sine egne
nameservere. I samme øyeblikk slutter NS1-sonen å være autoritativ, og
Squarespace-siden blir borte. Derfor bør nye poster være klare til å
settes inn med én gang.

## Kanonisk vertsnavn

I dag redirecter `idfrisor.com` til `https://www.idfrisor.com` med 301.
**www er kanonisk, og det beholder vi** — det er den varianten Google har
indeksert siden 2022. `astro.config.mjs` peker allerede dit, og
canonical-taggen i bygget HTML sier det samme. Ingen kodeendring trengs.

## Sjekkliste ved omlegging

Gjør dette først når overføringen er ferdig og domenet ligger i
Domeneshop-kontoen.

1. **Ikke si opp Squarespace ennå.** Den siden skal stå til den nye
   svarer.
2. Legg domenet til i Vercel:
   ```
   vercel domains add www.idfrisor.com
   vercel domains add idfrisor.com
   ```
   Vercel skriver da ut de eksakte postene som skal settes, og starter
   utstedelse av sertifikat. Bruk verdiene Vercel oppgir der og da —
   ikke verdier skrevet av herfra.
3. Sett www som primærdomene i Vercel. Da lager Vercel selv 301 fra
   apex til www, samme oppførsel som i dag.
4. I Domeneshop sin DNS-editor: behold DNS hos Domeneshop, fjern de
   fire A-postene og www-CNAME-en over, og sett inn Vercel sine.
5. Vent på propagering. Med TTL 14400 kan gamle svar henge igjen i
   opptil fire timer hos dem som har besøkt siden nylig. Sjekk med:
   ```
   dig +short www.idfrisor.com
   curl -sI https://www.idfrisor.com | head -3
   ```
6. Bekreft at sertifikatet er utstedt og at https svarer 200 på både
   apex og www.
7. Først da: si opp Squarespace.

## Senk TTL før du bytter

A-postene har i dag TTL 14400, altså fire timer. Det gjelder både
omleggingen og en eventuell rullback: setter du noe feil, kan feilen bli
stående i fire timer hos besøkende som allerede har slått opp domenet.

Senk TTL til 300 på A-postene minst fire timer — helst et døgn — før du
legger om. Da er både byttet og en rullback et spørsmål om minutter.
Sett TTL tilbake til noe normalt når alt står stabilt.

Er domenet alt flyttet og NS1-sonen utilgjengelig, går ikke dette å
gjøre, og da må du bare regne med fire timers etterslep.

## Hvis noe går galt

Sett tilbake postene i tabellen øverst. Hvor fort du er tilbake på
Squarespace avhenger av TTL-en som gjaldt da folk sist slo opp domenet.
