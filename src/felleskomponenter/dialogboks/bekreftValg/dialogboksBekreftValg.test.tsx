import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../melosyskodeverk";
import { BekreftValgTypes } from "../../../modals/bekreftValgTypes";

const mockDispatch = vi.fn();
vi.mock("../../../hooks", () => ({
  useDispatch: () => mockDispatch,
}));

let mockBekreftValgType = BekreftValgTypes.FERDIGBEHANDLET;
const mockSakstype = MKV.Koder.sakstyper.EU_EOS;
const mockBehandlingstema = "UTSENDT_ARBEIDSTAKER";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => undefined),
}));

vi.mock("../../../ducks/fagsaker", () => ({
  fagsakSelectors: {
    SaksnummerSelector: () => "SAK123",
    SakstypeKodeSelector: () => "EU_EOS",
  },
}));

vi.mock("../../../ducks/behandlinger", () => ({
  behandlingerSelectors: {
    BehandlingIDSelector: () => 1,
    BehandlingstemaKodeSelector: () => "UTSENDT_ARBEIDSTAKER",
  },
}));

vi.mock("../../../ducks/modaler", () => ({
  modalerOperations: { skjulBekreftValg: () => ({ type: "SKJUL" }) },
  modalerSelectors: {
    BekreftValgTypeSelector: () => mockBekreftValgType,
  },
}));

vi.mock("../../../ducks/navigering", () => ({
  navigeringOperations: { tilForsiden: () => ({ type: "NAV" }) },
}));

vi.mock("../../../services/api", () => ({
  Fagsaker: { fagsak: { bortfall: vi.fn(), ferdigbehandle: vi.fn(), annullerFagsak: vi.fn() } },
  Behandlinger: { resultat: { angiBehandlingsresultattype: vi.fn() } },
}));

vi.mock("../../../navFrontend", () => ({
  Modal: Object.assign(
    ({ children, header }: any) => (
      <div>
        <h2>{header?.heading}</h2>
        {children}
      </div>
    ),
    {
      Body: ({ children }: any) => <div>{children}</div>,
      Footer: ({ children }: any) => <div>{children}</div>,
    },
  ),
  BodyLong: ({ children }: any) => <span>{children}</span>,
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
}));

vi.mock("../../knapperad", () => ({
  default: ({ bekreftTekst, avbrytTekst }: any) => (
    <div>
      <button>{bekreftTekst}</button>
      <button>{avbrytTekst}</button>
    </div>
  ),
}));

import { useSelector } from "react-redux";
import { DialogboksBekreftValg } from "./dialogboksBekreftValg";

describe("DialogboksBekreftValg", () => {
  beforeEach(() => {
    let callIndex = 0;
    vi.mocked(useSelector).mockImplementation(() => {
      const idx = callIndex++;
      switch (idx) {
        case 0:
          return "SAK123"; // saksnummer
        case 1:
          return 1; // behandlingID
        case 2:
          return mockSakstype; // sakstype
        case 3:
          return mockBehandlingstema; // behandlingstema
        case 4:
          return mockBekreftValgType; // bekreftValgType
        default:
          return undefined;
      }
    });
  });

  it("rendrer modal med tittel og knapper", () => {
    mockBekreftValgType = BekreftValgTypes.FERDIGBEHANDLET;
    render(<DialogboksBekreftValg />);
    expect(screen.getByText("Ferdigbehandlet")).toBeDefined();
    expect(screen.getByText("Bekreft")).toBeDefined();
    expect(screen.getByText("Avbryt")).toBeDefined();
  });

  it("viser riktig tekst for FERDIGBEHANDLET", () => {
    mockBekreftValgType = BekreftValgTypes.FERDIGBEHANDLET;
    render(<DialogboksBekreftValg />);
    expect(screen.getByText(/ferdigbehandlet\? Vurder om du bør/)).toBeDefined();
  });

  it("viser riktig tekst for AVSLUTT_SAK_SOM_BORTFALT", () => {
    mockBekreftValgType = BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT;
    render(<DialogboksBekreftValg />);
    expect(screen.getByText(/behandlingen ikke kan behandles/)).toBeDefined();
  });

  it("viser riktig tittel for SOKNADEN_ER_AVSLATT", () => {
    mockBekreftValgType = BekreftValgTypes.SOKNADEN_ER_AVSLATT;
    render(<DialogboksBekreftValg />);
    expect(screen.getByText("Søknaden er avslått")).toBeDefined();
  });
});
