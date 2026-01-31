import { describe, it, expect } from "vitest";

import {
  SAKSPLUKKER_FORM,
  SEND_BREV,
  FORSIDE_JOURNALFORINGS_FORM,
  JOURNALFORING,
  JOURNALFORING_SED,
  JournalforingValues,
  SOKNAD,
  SOK_ETTER_SAK,
  OPPRETT_NY_SAK,
  OpprettNySakValues,
  Trygdeavtale,
} from "./form";

describe("form konstanter", () => {
  it("eksporterer formnavn-konstanter", () => {
    expect(SAKSPLUKKER_FORM).toBe("saksplukkerform");
    expect(SEND_BREV).toBe("send_brev");
    expect(FORSIDE_JOURNALFORINGS_FORM).toBe("journalforingsform");
    expect(JOURNALFORING).toBe("journalforing");
    expect(JOURNALFORING_SED).toBe("journalforing_sed");
    expect(SOKNAD).toBe("soknad");
    expect(SOK_ETTER_SAK).toBe("sokEtterSak");
    expect(OPPRETT_NY_SAK).toBe("opprett_ny_sak");
  });

  it("JournalforingValues har forventede felt", () => {
    expect(JournalforingValues.sakstype).toBe("sakstype");
    expect(JournalforingValues.sakstema).toBe("sakstema");
    expect(JournalforingValues.formNavn).toBe("journalforing");
  });

  it("OpprettNySakValues har forventede felt", () => {
    expect(OpprettNySakValues.sakstype).toBe("sakstype");
    expect(OpprettNySakValues.formNavn).toBe("opprett_ny_sak");
  });

  it("Trygdeavtale har alle steg", () => {
    expect(Trygdeavtale.INNGANG).toContain("trygdeavtale");
    expect(Trygdeavtale.AVKLAR_VIRKSOMHET).toContain("trygdeavtale");
    expect(Trygdeavtale.BESTEMMELSE).toContain("trygdeavtale");
    expect(Trygdeavtale.FAMILIE).toContain("trygdeavtale");
    expect(Trygdeavtale.VEDTAK).toContain("trygdeavtale");
  });
});
