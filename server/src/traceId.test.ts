import assert from "node:assert/strict";
import http from "node:http";
import { after, before, describe, test } from "node:test";

import express from "express";

import { request } from "./testUtils/httpClient.js";
import { aktivTraceId, HentTraceId, TRACE_ID_HEADER, traceIdHeader } from "./traceId.js";

const TRACE_ID = "4bf92f3577b34da6a3ce929d0e0e4736";

let server: http.Server;
let baseUrl: string;

function lagApp() {
  const app = express();
  const ruter: Record<string, HentTraceId> = {
    "/med-trace": () => TRACE_ID,
    "/uten-trace": () => undefined,
    "/feiler": () => {
      throw new Error("OTel feilet");
    },
    "/aktiv": aktivTraceId,
  };
  for (const [path, hentTraceId] of Object.entries(ruter)) {
    app.get(path, traceIdHeader(hentTraceId), (_request, response) => {
      response.status(200).send("ok");
    });
  }
  app.get("/bad-gateway", traceIdHeader(() => TRACE_ID), (_request, response) => {
    response.writeHead(502, { "Content-Type": "text/plain" });
    response.end("502 Bad Gateway");
  });
  return app;
}

describe("traceIdHeader", () => {
  before(async () => {
    server = lagApp().listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (typeof address !== "object" || address === null) throw new Error("Fikk ikke port");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test("setter X-Trace-Id når traceId finnes", async () => {
    const response = await request(baseUrl, "/med-trace");

    assert.equal(response.status, 200);
    assert.equal(response.headers[TRACE_ID_HEADER.toLowerCase()], TRACE_ID);
  });

  test("beholder X-Trace-Id på feilsvar skrevet med writeHead", async () => {
    const response = await request(baseUrl, "/bad-gateway");

    assert.equal(response.status, 502);
    assert.equal(response.headers[TRACE_ID_HEADER.toLowerCase()], TRACE_ID);
  });

  test("utelater headeren når traceId mangler", async () => {
    const response = await request(baseUrl, "/uten-trace");

    assert.equal(response.status, 200);
    assert.equal(response.headers[TRACE_ID_HEADER.toLowerCase()], undefined);
  });

  test("feil ved henting av traceId stopper ikke requesten", async () => {
    const response = await request(baseUrl, "/feiler");

    assert.equal(response.status, 200);
    assert.equal(response.body, "ok");
    assert.equal(response.headers[TRACE_ID_HEADER.toLowerCase()], undefined);
  });

  test("uten OpenTelemetry-agent finnes ingen aktiv trace", async () => {
    const response = await request(baseUrl, "/aktiv");

    assert.equal(response.status, 200);
    assert.equal(response.headers[TRACE_ID_HEADER.toLowerCase()], undefined);
  });
});
