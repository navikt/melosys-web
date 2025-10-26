import { describe, expect, beforeEach, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Avklartefakta } from "../api";

const server = setupServer();

describe("Avklartefakta endepunkt", () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: "bypass" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("GET /api/avklartefakta/:behandlingID", async () => {
    const avklartefakta = {
      referanse: "BOSTEDSLAND",
      avklartefaktaKode: "BOSTEDSLAND",
      fakta: ["NO"],
      subjektID: null,
      begrunnelseKoder: ["OPPHOLD_MER_ENN_12_MND"],
      begrunnelseFritekst: "En egen fritekstbegrunnelse som ikke finnes i kodeverket",
    };
    const behandlingID = 4;

    server.use(
      http.get(`/api/avklartefakta/${behandlingID}`, () => {
        return HttpResponse.json(avklartefakta);
      }),
    );

    // assert on the response
    const res = await Avklartefakta.hent(behandlingID);
    expect(res).toEqual(avklartefakta);
  });

  test("POST /api/avklartefakta/:behandlingID", async () => {
    const avklartefakta = {
      referanse: "BOSTEDSLAND",
      avklartefaktaKode: "BOSTEDSLAND",
      fakta: ["NO"],
      subjektID: null,
      begrunnelseKoder: ["OPPHOLD_MER_ENN_12_MND"],
      begrunnelseFritekst: "En egen fritekstbegrunnelse som ikke finnes i kodeverket",
    };
    const behandlingID = 4;

    server.use(
      http.post(`/api/avklartefakta/${behandlingID}`, () => {
        return HttpResponse.json([avklartefakta]);
      }),
    );

    // assert on the response
    const res = await Avklartefakta.send(behandlingID, [avklartefakta]);
    expect(res).toEqual([avklartefakta]);
  });
});
