/**
 * Liten statisk server for dist/, brukt av screenshot.mjs og qa.mjs.
 * Vi serverer selv i stedet for `astro preview`, som kjører som en
 * bakgrunnsdaemon og derfor ikke lar seg stoppe fra skriptene.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const TYPER = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".json": "application/json",
};

export function startServer(rot = "dist", port = 0) {
  const server = createServer(async (req, res) => {
    try {
      let sti = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (sti.endsWith("/")) sti += "index.html";
      if (!extname(sti)) sti += "/index.html";
      const data = await readFile(join(process.cwd(), rot, sti));
      res.writeHead(200, {
        "content-type": TYPER[extname(sti)] ?? "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404).end("404");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () =>
      resolve({
        url: `http://localhost:${server.address().port}`,
        stopp: () => new Promise((r) => server.close(r)),
      }),
    );
  });
}
