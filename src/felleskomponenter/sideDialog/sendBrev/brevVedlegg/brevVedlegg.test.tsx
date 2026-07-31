import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BrevVedlegg from "./brevVedlegg";

vi.mock("../../../../services/api", () => ({
  DokumenterV2: { FeltType: { VEDLEGG: "VEDLEGG", FRITEKSTVEDLEGG: "FRITEKSTVEDLEGG" } },
}));

vi.mock("../../../vedleggTable", () => ({ default: () => null }));
vi.mock("../../../vedleggvelger", () => ({ default: () => null }));

vi.mock("../../../skjema", () => ({
  Input: () => null,
  HTMLEditor: ({ placeholderVerdier, gyldigeNokler }: any) => (
    <div
      data-testid="html-editor"
      data-verdier={JSON.stringify(placeholderVerdier)}
      data-nokler={JSON.stringify(gyldigeNokler)}
    />
  ),
}));

vi.mock("../../../../featuretoggle/useFeatureToggle", () => ({ default: () => true }));

vi.mock("../../../../services/api/placeholdere", () => ({
  usePlaceholderVerdier: () => ({ data: [{ nokkel: "saksnummer", verdi: "MEL-21" }] }),
  usePlaceholderKatalog: () => ({ data: [{ nokkel: "saksnummer", visningsnavn: "Saksnummer" }] }),
}));

const props = {
  standardvedlegg: [],
  fritekstvedlegg: [],
  setFritekstvedlegg: vi.fn(),
  valgteVedlegg: { saksvedlegg: [], standardvedlegg: null },
  setValgteVedlegg: vi.fn(),
  changeField: vi.fn(),
  formValues: { valgtBrev: { felter: [{ kode: "FRITEKSTVEDLEGG", beskrivelse: "Legg til fritekstvedlegg" }] } },
  redigerbart: true,
  behandlingID: 123,
  dokumenter: [],
  mottakerErNorskMyndighet: false,
  visFritekstvedleggSkjema: true,
  setVisFritekstvedleggSkjema: vi.fn(),
  setRedigerFritekstvedleggIndex: vi.fn(),
};

describe("BrevVedlegg", () => {
  it("gir fritekstvedlegg-editoren samme placeholder-kontekst som brevfeltene", () => {
    render(<BrevVedlegg {...props} />);

    const editor = screen.getByTestId("html-editor");
    expect(JSON.parse(editor.getAttribute("data-verdier") ?? "null")).toEqual([
      { nokkel: "saksnummer", verdi: "MEL-21" },
    ]);
    expect(JSON.parse(editor.getAttribute("data-nokler") ?? "null")).toEqual(["saksnummer"]);
  });
});
