import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  CheckboxGroup: ({ children }: any) => <div>{children}</div>,
  Checkbox: ({ children, onChange }: any) => (
    <label>
      <input type="checkbox" onChange={onChange} />
      {children}
    </label>
  ),
}));

vi.mock("../../../../felleskomponenter/stegvelger", () => ({
  konverterAvklartfaktaTilStegData: vi.fn(),
  lagAvklartfakta: vi.fn(() => "lagret"),
  slettAvklartfakta: vi.fn(() => "slettet"),
}));

vi.mock("../../../../kodeverk", () => ({
  Koder: { avklartefaktaKoder: { ARBEID_UTFORES_I_OPPGITT_LAND: "ARBEID_UTFORES_I_OPPGITT_LAND" } },
}));

vi.mock("../../../../constants", () => ({
  BOOLSK_STRING: { SANN: "SANN" },
}));

vi.mock("../../../../domeneUtils", () => ({
  hentFaktaVerdi: (fakta: any) => fakta?.verdi,
}));

import IngenSokkelSkipEllerHjemmebaser from "./ingenSokkelSkipEllerHjemmebaser";

describe("IngenSokkelSkipEllerHjemmebaser", () => {
  it("rendrer info-alert og checkbox", () => {
    render(<IngenSokkelSkipEllerHjemmebaser oppdaterData={vi.fn()} slettData={vi.fn()} redigerbart={true} />);
    expect(screen.getByText(/Panelene er ikke utfylt/)).toBeDefined();
    expect(screen.getByText("Arbeid utføres i land som er oppgitt")).toBeDefined();
  });

  it("kaller oppdaterData ved mount", () => {
    const oppdater = vi.fn();
    render(<IngenSokkelSkipEllerHjemmebaser oppdaterData={oppdater} slettData={vi.fn()} redigerbart={true} />);
    expect(oppdater).toHaveBeenCalled();
  });

  it("kaller slettData ved unmount", () => {
    const slett = vi.fn();
    const { unmount } = render(
      <IngenSokkelSkipEllerHjemmebaser oppdaterData={vi.fn()} slettData={slett} redigerbart={true} />,
    );
    unmount();
    expect(slett).toHaveBeenCalled();
  });
});
