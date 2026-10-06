import "./testUtils/setupTestEnv.js";

import assert from "node:assert/strict";
import http from "node:http";
import { after, before, describe, test } from "node:test";

import { requestChunked, request } from "./testUtils/httpClient.js";

// Peker upstreams til en lokal test-backend før server.js importeres, siden
// config.ts leser miljøvariabler ved modul-last.
process.env.APP_URL_MELOSYS = "http://127.0.0.1:0"; // overskrives i before()

let backend: http.Server;
let backendUrl: string;
let app: http.Server;
let appUrl: string;

describe("apiProxy", () => {
  before(async () => {
    // Enkel echo-backend: svarer med hvor mange bytes den mottok.
    backend = http.createServer((incomingRequest, response) => {
      const chunks: Buffer[] = [];
      incomingRequest.on("data", (chunk: Buffer) => chunks.push(chunk));
      incomingRequest.on("end", () => {
        const body = Buffer.concat(chunks);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ receivedBytes: body.length }));
      });
    });
    await new Promise<void>((resolve) => backend.listen(0, "127.0.0.1", resolve));
    const backendAddress = backend.address();
    if (typeof backendAddress !== "object" || backendAddress === null) throw new Error("Fikk ikke port fra backend");
    backendUrl = `http://127.0.0.1:${backendAddress.port}`;
    process.env.APP_URL_MELOSYS = backendUrl;

    const serverModule = await import("./server.js");
    app = serverModule.default.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => app.once("listening", resolve));
    const appAddress = app.address();
    if (typeof appAddress !== "object" || appAddress === null) throw new Error("Fikk ikke port fra appen");
    appUrl = `http://127.0.0.1:${appAddress.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => app.close(() => resolve()));
    await new Promise<void>((resolve) => backend.close(() => resolve()));
  });

  test("liten POST-body proxy'es i sin helhet (regresjonstest for kroppslesing før proxy)", async () => {
    const response = await request(appUrl, "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": "17" },
      body: '{"query":"{ x }"}',
    });

    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.body), { receivedBytes: 17 });
  });

  test("POST-body med chunked transfer-encoding proxy'es i sin helhet", async () => {
    const body = Buffer.from("a".repeat(10_000));
    const response = await requestChunked(appUrl, "/api/echo", body);

    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.body), { receivedBytes: 10_000 });
  });

  test("POST-body over 1 MB avvises med 413 uten å nå backend", async () => {
    const body = Buffer.alloc(2 * 1024 * 1024, "x");
    const response = await request(appUrl, "/api/echo", {
      method: "POST",
      headers: { "Content-Length": String(body.length) },
      body,
    });

    assert.equal(response.status, 413);
  });

  test("/melosys/api svarer 404 i stedet for å falle tilbake til SPA-en", async () => {
    const response = await request(appUrl, "/melosys/api/foo");
    assert.equal(response.status, 404);
  });

  test("feil mot backend gir 502 uten å eksponere backend-adressen", async () => {
    // Lukk backend midlertidig for å simulere at den ikke svarer.
    await new Promise<void>((resolve) => backend.close(() => resolve()));

    const response = await request(appUrl, "/api/echo");

    assert.equal(response.status, 502);
    assert.ok(!response.body.includes(backendUrl));

    // Åpne backend igjen slik at after() kan lukke den på nytt uten feil.
    await new Promise<void>((resolve) => backend.listen(0, "127.0.0.1", resolve));
  });
});
