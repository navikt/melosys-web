import { describe, expect, it } from "vitest";

import { gyldigeValg, SaksplukkerFormData, TOMT_SKJEMA } from "./gyldigeValg";

const koder = (...k: string[]) => k.map((kode) => ({ kode, term: kode }));

const VALG: SaksplukkerFormData = {
  sakstype: "EU_EOS",
  sakstema: "MEDLEMSKAP_LOVVALG",
  behandlingstema: "UTSENDT_ARBEIDSTAKER",
};

const LOVLIGE = {
  sakstyper: koder("EU_EOS", "TRYGDEAVTALE"),
  sakstemaer: koder("MEDLEMSKAP_LOVVALG", "UNNTAK"),
  behandlingstemaer: koder("UTSENDT_ARBEIDSTAKER"),
};

describe("gyldigeValg", () => {
  it("beholder lovlige valg", () => {
    expect(gyldigeValg(VALG, LOVLIGE)).toEqual(VALG);
  });

  it("tømmer hele skjemaet når sakstypen er ulovlig", () => {
    expect(gyldigeValg({ ...VALG, sakstype: "FINNES_IKKE" }, LOVLIGE)).toEqual(TOMT_SKJEMA);
  });

  it("tømmer sakstema og behandlingstema når sakstemaet er ulovlig", () => {
    expect(gyldigeValg({ ...VALG, sakstema: "FINNES_IKKE" }, LOVLIGE)).toEqual({
      sakstype: "EU_EOS",
      sakstema: "",
      behandlingstema: "",
    });
  });

  it("tømmer bare behandlingstema når det er ulovlig", () => {
    expect(gyldigeValg({ ...VALG, behandlingstema: "FINNES_IKKE" }, LOVLIGE)).toEqual({
      ...VALG,
      behandlingstema: "",
    });
  });

  it("beholder valg når listene ikke er hentet ennå", () => {
    const ugyldige = { sakstype: "X", sakstema: "Y", behandlingstema: "Z" };

    expect(gyldigeValg(ugyldige, {})).toEqual(ugyldige);
  });
});
