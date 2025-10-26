import { describe, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { Avklartefakta } from "../api";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

describe("Avklartefakta endepunkt", () => {
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

    mswServer.use(
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

    mswServer.use(
      http.post(`/api/avklartefakta/${behandlingID}`, () => {
        return HttpResponse.json([avklartefakta]);
      }),
    );

    // assert on the response
    const res = await Avklartefakta.send(behandlingID, [avklartefakta]);
    expect(res).toEqual([avklartefakta]);
  });
});
