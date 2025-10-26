import { describe, expect, beforeEach, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Journalforing } from "../api";

const server = setupServer();

describe("Journalforing endepunkt", () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

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

    server.use(
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

    server.use(
      http.post("/api/journalforing/opprett", () => {
        return HttpResponse.json(oppgave);
      }),
    );

    // assert on the response
    const res = await Journalforing.opprett(oppgave);
    expect(res).toEqual(oppgave);
  });
});
