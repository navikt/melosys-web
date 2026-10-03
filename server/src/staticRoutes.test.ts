import "./testUtils/setupTestEnv.js";

import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";

import { request } from "./testUtils/httpClient.js";

let staticDir: string;
let secretFileOutsideStaticDir: string;
let app: http.Server;
let appUrl: string;

describe("staticRoutes", () => {
  before(async () => {
    // Bygger opp en enkel test-frontend i en midlertidig mappe, samt en
    // "hemmelig" fil rett utenfor staticDir for å verifisere at den ikke
    // kan leses via path traversal (jf. sikkerhetsfunne
    // t fra QA-runde 1).
    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "static-routes-test-"));
    staticDir = path.join(workDir, "public");
    await fs.mkdir(path.join(staticDir, "assets"), { recursive: true });
    await fs.writeFile(path.join(staticDir, "index.html"), "<html>index</html>");
    await fs.writeFile(path.join(staticDir, "assets", "app.css"), "body{}");

    secretFileOutsideStaticDir = path.join(workDir, "hemmelig.txt");
    await fs.writeFile(secretFileOutsideStaticDir, "HEMMELIG-INNHOLD");

    process.env.STATIC_DIR = staticDir;

    const serverModule = await import("./server.js");
    app = serverModule.default.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => app.once("listening", resolve));
    const appAddress = app.address();
    if (typeof appAddress !== "object" || appAddress === null) throw new Error("Fikk ikke port fra appen");
    appUrl = `http://127.0.0.1:${appAddress.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => app.close(() => resolve()));
  });

  test("/melosys/ serverer index.html", async () => {
    const response = await request(appUrl, "/melosys/");
    assert.equal(response.status, 200);
    assert.equal(response.body, "<html>index</html>");
  });

  test("/melosys/assets/app.css serverer den statiske filen", async () => {
    const response = await request(appUrl, "/melosys/assets/app.css");
    assert.equal(response.status, 200);
    assert.equal(response.body, "body{}");
  });

  test("manglende fil under /melosys/assets gir 404, ikke SPA-fallback", async () => {
    const response = await request(appUrl, "/melosys/assets/finnes-ikke.css");
    assert.equal(response.status, 404);
  });

  test("path traversal-forsøk kan ikke lese filer utenfor staticDir", async () => {
    // Regresjonstest for den kritiske sårbarheten fra QA-runde 1: sendFile
    // brukte path.join + absolutt sti, som lot ".."-segmenter unnslippe
    // staticDir. Nå skal forsøket falle trygt tilbake til index.html.
    const relativeTraversal = `/melosys/../../${path.basename(path.dirname(secretFileOutsideStaticDir))}/hemmelig.txt`;
    const response = await request(appUrl, encodeURI(relativeTraversal));

    assert.ok(!response.body.includes("HEMMELIG-INNHOLD"), "Svaret skal ikke inneholde hemmelig filinnhold");
  });

  test("GET / bevarer query-parametre i redirect til /melosys/", async () => {
    const response = await request(appUrl, "/?code=abc123");
    assert.equal(response.status, 301);
    assert.equal(response.headers.location, "/melosys/?code=abc123");
  });

  test("GET / uten query-parametre redirecter til /melosys/ uten trailing ?", async () => {
    const response = await request(appUrl, "/");
    assert.equal(response.status, 301);
    assert.equal(response.headers.location, "/melosys/");
  });
});
