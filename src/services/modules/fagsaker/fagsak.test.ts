import { describe, it, expect, vi } from "vitest";
import {
  hent,
  opprettNySak,
  opprettNyBehandlingForSak,
  henlegg,
  bortfall,
  videresend,
  utpek,
  endreFagsak,
  ferdigbehandle,
  hentTrygdeavgiftOppsummering,
  annullerFagsak,
  hentFullmektigHistorikk,
  lagreBetalingsvalgForPensjonister,
} from "./fagsak";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
}));

const minReqDto = { behandlingstema: "T", behandlingstype: "B", skalTilordnes: false };

describe("fagsak", () => {
  it("hent returnerer promise", () => {
    expect(hent("123")).toBeInstanceOf(Promise);
  });

  it("opprettNySak returnerer promise", () => {
    expect(opprettNySak(minReqDto)).toBeInstanceOf(Promise);
  });

  it("opprettNyBehandlingForSak returnerer promise", () => {
    expect(opprettNyBehandlingForSak("123", minReqDto)).toBeInstanceOf(Promise);
  });

  it("henlegg returnerer promise", () => {
    expect(henlegg("123", { begrunnelseKode: "K", fritekst: null })).toBeInstanceOf(Promise);
  });

  it("bortfall returnerer promise", () => {
    expect(bortfall(1)).toBeInstanceOf(Promise);
  });

  it("videresend returnerer promise", () => {
    expect(videresend("123", { mottakerinstitusjon: null, fritekst: null, vedlegg: [] })).toBeInstanceOf(Promise);
  });

  it("utpek returnerer promise", () => {
    expect(utpek("123", { mottakerinstitusjoner: [], fritekstSed: null, fritekstBrev: null })).toBeInstanceOf(Promise);
  });

  it("endreFagsak returnerer promise", () => {
    expect(
      endreFagsak("123", {
        behandlingID: 1,
        sakstype: "S",
        sakstema: "T",
        behandlingstema: "B",
        behandlingstype: "BT",
      }),
    ).toBeInstanceOf(Promise);
  });

  it("ferdigbehandle returnerer promise", () => {
    expect(ferdigbehandle(1)).toBeInstanceOf(Promise);
  });

  it("hentTrygdeavgiftOppsummering returnerer promise", () => {
    expect(hentTrygdeavgiftOppsummering("123")).toBeInstanceOf(Promise);
  });

  it("annullerFagsak returnerer promise", () => {
    expect(annullerFagsak("123")).toBeInstanceOf(Promise);
  });

  it("hentFullmektigHistorikk returnerer promise", () => {
    expect(hentFullmektigHistorikk("123")).toBeInstanceOf(Promise);
  });

  it("lagreBetalingsvalgForPensjonister returnerer promise", () => {
    expect(lagreBetalingsvalgForPensjonister("123", "ARBEIDSGIVER")).toBeInstanceOf(Promise);
  });
});
