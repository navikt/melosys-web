import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import MKV from "../../melosyskodeverk";

const mockData = {
  hentSaksopplysninger: {
    persondata: {
      navn: { fornavn: "Ola", mellomnavn: null, etternavn: "Nordmann" },
      kjoenn: "MANN",
      folkeregisteridentifikator: "12345678901",
      statsborgerskap: [
        { land: "NOR", erHistorisk: false },
        { land: "SWE", erHistorisk: true },
      ],
      sivilstand: [{ type: "GIFT", erHistorisk: false }],
      folkeregisterpersonstatuser: [{ kode: "BOSATT", erHistorisk: false }],
    },
  },
};

vi.mock("./hentpersonopplysninger.generated", () => ({
  useHentPersonopplysningerQuery: vi.fn(() => ({ data: mockData, error: undefined })),
}));

vi.mock("../../utils/streng", () => ({
  storeForbokstaverForLand: (land: string) => land,
}));

vi.mock("../../utils/person", () => ({
  tilSammensattNavn: (fornavn: string, _mellomnavn: string | null, etternavn: string) => `${fornavn} ${etternavn}`,
}));

import useHentPersonopplysninger from "./useHentpersonopplysninger";
import { useHentPersonopplysningerQuery } from "./hentpersonopplysninger.generated";

describe("useHentPersonopplysninger", () => {
  it("returnerer personopplysninger fra graphql-data", () => {
    const { result } = renderHook(() => useHentPersonopplysninger(1, false));
    expect(result.current).not.toBeNull();
    expect(result.current?.navn).toBe("Ola Nordmann");
    expect(result.current?.fnr).toBe("12345678901");
    expect(result.current?.kjoenn).toBe("MANN");
  });

  it("filtrerer ut historiske statsborgerskap", () => {
    const { result } = renderHook(() => useHentPersonopplysninger(1, false));
    expect(result.current?.statsborgerskap).toEqual(["NOR"]);
  });

  it("returnerer null ved feil", () => {
    vi.mocked(useHentPersonopplysningerQuery).mockReturnValueOnce({ data: undefined, error: new Error("feil") } as any);
    const { result } = renderHook(() => useHentPersonopplysninger(1, false));
    expect(result.current).toBeNull();
  });

  it("setter erDoed basert på MKV personstatus-kode", () => {
    const doedData = structuredClone(mockData);
    doedData.hentSaksopplysninger.persondata.folkeregisterpersonstatuser = [
      { kode: MKV.Koder.personstatuser.DOED, erHistorisk: false },
    ];
    vi.mocked(useHentPersonopplysningerQuery).mockReturnValueOnce({ data: doedData, error: undefined } as any);
    const { result } = renderHook(() => useHentPersonopplysninger(1, false));
    expect(result.current?.erDoed).toBe(true);
  });
});
