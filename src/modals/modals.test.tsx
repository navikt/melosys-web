import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockDispatch = vi.fn();
vi.mock("../hooks", () => ({
  useDispatch: () => mockDispatch,
}));

let mockVisOppfrisk = false;
let mockVisHenlegg = false;
let mockVisAvslag = false;
let mockVisBekreft = false;

vi.mock("react-redux", () => ({
  useSelector: vi.fn((selector: any) => selector()),
}));

vi.mock("../contexts", () => ({
  FellesHandlersContext: {
    _currentValue: {
      skjulOppfriskModalOgNavigerTilForside: vi.fn(),
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger: vi.fn(),
    },
  },
}));

vi.mock("../ducks/modaler", () => ({
  modalerOperations: {
    skjulOppfrisk: () => ({ type: "SKJUL_OPPFRISK" }),
    fjernBehandlingOppfriskes: () => ({ type: "FJERN" }),
    skjulHenlegg: () => ({ type: "SKJUL_HENLEGG" }),
    skjulAvslagSoknad: () => ({ type: "SKJUL_AVSLAG" }),
  },
  modalerSelectors: {
    ErOppfriskSynligSelector: () => mockVisOppfrisk,
    ErHenleggSynligSelector: () => mockVisHenlegg,
    ErAvslagSoknadSynligSelector: () => mockVisAvslag,
    ErBekreftValgSynligSelector: () => mockVisBekreft,
  },
}));

vi.mock("../felleskomponenter/dialogboks", () => ({
  DialogboksOppfriskSak: () => <div>OppfriskDialog</div>,
  DialogboksHenleggSak: () => <div>HenleggDialog</div>,
  DialogboksAvslagSoknad: () => <div>AvslagDialog</div>,
  DialogboksBekreftValg: () => <div>BekreftValgDialog</div>,
}));

import Modals from "./modals";

describe("Modals", () => {
  beforeEach(() => {
    mockVisOppfrisk = false;
    mockVisHenlegg = false;
    mockVisAvslag = false;
    mockVisBekreft = false;
  });

  it("rendrer ingen dialoger som default", () => {
    const { container } = render(<Modals />);
    expect(container.textContent).toBe("");
  });

  it("viser OppfriskDialog når synlig", () => {
    mockVisOppfrisk = true;
    render(<Modals />);
    expect(screen.getByText("OppfriskDialog")).toBeDefined();
  });

  it("viser HenleggDialog når synlig", () => {
    mockVisHenlegg = true;
    render(<Modals />);
    expect(screen.getByText("HenleggDialog")).toBeDefined();
  });

  it("viser BekreftValgDialog når synlig", () => {
    mockVisBekreft = true;
    render(<Modals />);
    expect(screen.getByText("BekreftValgDialog")).toBeDefined();
  });
});
