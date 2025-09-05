import { describe, it, expect, beforeEach } from "vitest";
import { Avklartefakta } from "../api";

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
  mockReject: (error: Error) => void;
};

describe("Avklartefakta endepunkt", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  test("GET /api/avklartefakta/:behandlingID", () => {
    const avklartefakta = {
      referanse: "BOSTEDSLAND",
      avklartefaktaKode: "BOSTEDSLAND",
      fakta: ["NO"],
      subjektID: null,
      begrunnelseKoder: ["OPPHOLD_MER_ENN_12_MND"],
      begrunnelseFritekst: "En egen fritekstbegrunnelse som ikke finnes i kodeverket",
    };
    fetch.mockResponse(JSON.stringify(avklartefakta));

    const behandlingID = 4;
    // assert on the response
    Avklartefakta.hent(behandlingID).then((res) => {
      expect(res).toEqual(avklartefakta);
    });

    // assert on the times called and arguments given to fetch
    expect((fetch as any).mock.calls.length).toEqual(1);
    expect((fetch as any).mock.calls[0][0]).toEqual(`/api/avklartefakta/${behandlingID}`);
  });

  test("POST /api/avklartefakta/opprett", () => {
    const avklartefakta = {
      referanse: "BOSTEDSLAND",
      avklartefaktaKode: "BOSTEDSLAND",
      fakta: ["NO"],
      subjektID: null,
      begrunnelseKoder: ["OPPHOLD_MER_ENN_12_MND"],
      begrunnelseFritekst: "En egen fritekstbegrunnelse som ikke finnes i kodeverket",
    };
    fetch.mockResponse(JSON.stringify(avklartefakta));

    const behandlingID = 4;
    // assert on the response
    Avklartefakta.send(behandlingID, [avklartefakta]).then((res) => {
      expect(res).toEqual(avklartefakta);
    });
  });
});
