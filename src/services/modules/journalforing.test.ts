import { describe, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { Journalforing } from "../api";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

describe("Journalforing endepunkt", () => {
  test("GET /api/journalforing/:journalpostID/:oppgaveID", async () => {
    const oppgave = {
      brukerID: "30098000492",
      avsenderID: null,
      erHovedpartAvsender: true,
      dokument: {
        ID: "Dok_ID",
        tittel: "Søknad om medlemskap",
        mottattDato: "2018-05-04T15:15:25.622",
      },
    };
    const journalpostID = "DOK_3789";

    mswServer.use(
      http.get(`/api/journalforing/${journalpostID}`, () => {
        return HttpResponse.json(oppgave);
      }),
    );

    // assert on the response
    const res = await Journalforing.hent(journalpostID);
    expect(res).toEqual(oppgave);
  });

  test("POST /api/journalforing/opprett", async () => {
    const oppgave = {
      brukerID: "30098000492",
      avsenderID: "30098000492",
      erHovedpartAvsender: true,
      dokument: {
        ID: "Dok_ID",
        tittel: "Søknad om medlemskap",
        mottattDato: "2018-05-04T15:15:25.622",
      },
    };

    mswServer.use(
      http.post("/api/journalforing/opprett", () => {
        return HttpResponse.json(oppgave);
      }),
    );

    // assert on the response
    const res = await Journalforing.opprett(oppgave);
    expect(res).toEqual(oppgave);
  });
});
