import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const behandlingID = 4711;

const { useSelectorMock, dispatchMock } = vi.hoisted(() => ({
  useSelectorMock: vi.fn(),
  dispatchMock: vi.fn(),
}));

vi.mock("../../utils", () => ({
  formaterTilNorskBelop: (val: number) => `${val} kr`,
  formaterTilNorskBelopUtenDesimaler: (val: number) => `${val}`,
  dato: {
    formatterDatoTilNorsk: (dato: string | null | undefined, _visTidspunkt?: boolean, defaultValue = "") => {
      if (!dato) return defaultValue;
      const [yyyy, mm, dd] = dato.split("-");
      return `${dd}.${mm}.${yyyy}`;
    },
  },
}));

vi.mock("../../hooks", () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock("react-redux", () => ({
  useSelector: (selector: any) => useSelectorMock(selector),
}));

vi.mock("../../ducks/behandlinger", () => ({
  behandlingerSelectors: { BehandlingIDSelector: Symbol("BehandlingIDSelector") },
}));

vi.mock("../../ducks/pensjonsopptjening", () => ({
  pensjonsopptjeningOperations: {
    hentPensjonsopptjening: vi.fn(() => ({ type: "hent" })),
  },
  pensjonsopptjeningSelectors: {
    PensjonsopptjeningSelector: Symbol("PensjonsopptjeningSelector"),
    PensjonsopptjeningPerioderSelector: Symbol("PensjonsopptjeningPerioderSelector"),
  },
  pensjonsopptjeningTypes: {},
}));

vi.mock("../../services", () => ({
  STATUS: {
    NOT_STARTED: "NOT_STARTED",
    PENDING: "PENDING",
    OK: "OK",
    ERROR: "ERROR",
  },
}));

vi.mock("../../navFrontend", () => ({
  VStack: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <h2>{children}</h2>,
  Alert: ({ children, variant }: any) => <div data-variant={variant}>{children}</div>,
  Loader: () => <div>laster…</div>,
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

import { behandlingerSelectors } from "../../ducks/behandlinger";
import { pensjonsopptjeningSelectors } from "../../ducks/pensjonsopptjening";
import Pensjonsopptjening from "./pensjonsopptjening";

const mockState = ({ status, perioder }: { status: string; perioder: any[] }) => {
  useSelectorMock.mockImplementation((selector: any) => {
    if (selector === behandlingerSelectors.BehandlingIDSelector) return behandlingID;
    if (selector === pensjonsopptjeningSelectors.PensjonsopptjeningSelector) return { status, data: { perioder } };
    if (selector === pensjonsopptjeningSelectors.PensjonsopptjeningPerioderSelector) return perioder;
    return undefined;
  });
};

describe("Pensjonsopptjening", () => {
  beforeEach(() => {
    useSelectorMock.mockReset();
    dispatchMock.mockReset();
  });

  it("rendrer ingenting før første henting (status NOT_STARTED)", () => {
    mockState({ status: "NOT_STARTED", perioder: [] });
    const { container } = render(<Pensjonsopptjening />);
    expect(container).toBeEmptyDOMElement();
  });

  it("viser loader under PENDING", () => {
    mockState({ status: "PENDING", perioder: [] });
    render(<Pensjonsopptjening />);
    expect(screen.getByText(/laster/)).toBeDefined();
  });

  it("viser tabell med rader sortert nyeste år først", () => {
    mockState({
      status: "OK",
      perioder: [
        { aar: 2023, pgi: 510000, kilde: "SKATT" },
        { aar: 2024, pgi: 540000, kilde: "SKATT" },
        { aar: 2024, pgi: 120000, kilde: "AVGIFTSSYSTEMET" },
      ],
    });
    render(<Pensjonsopptjening />);
    expect(screen.getByRole("heading", { name: "Pensjonsopptjening" })).toBeDefined();
    const rows = screen.getAllByRole("row");
    // første rad er header
    expect(rows.length).toBe(4);
    expect(rows[1].textContent).toContain("2024");
    expect(rows[1].textContent).toContain("Skatt");
    expect(rows[2].textContent).toContain("2024");
    expect(rows[2].textContent).toContain("Avgiftssystemet");
    expect(rows[3].textContent).toContain("2023");
  });

  it("viser «Registrert» og «Oppdatert»-kolonner formatert som dd.MM.yyyy", () => {
    mockState({
      status: "OK",
      perioder: [{ aar: 2025, pgi: 540000, kilde: "SKATT", registrert: "2026-05-01", oppdatert: "2026-05-12" }],
    });
    render(<Pensjonsopptjening />);
    expect(screen.getByRole("columnheader", { name: "Registrert" })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Oppdatert" })).toBeDefined();
    expect(screen.getByText("01.05.2026")).toBeDefined();
    expect(screen.getByText("12.05.2026")).toBeDefined();
  });

  it("viser «—» når registrert/oppdatert er null eller undefined", () => {
    mockState({
      status: "OK",
      perioder: [{ aar: 2025, pgi: 540000, kilde: "SKATT", registrert: null, oppdatert: undefined }],
    });
    render(<Pensjonsopptjening />);
    const emDashCells = screen.getAllByText("—");
    expect(emDashCells.length).toBe(2);
  });

  it("viser info-alert når perioder er tom", () => {
    mockState({ status: "OK", perioder: [] });
    render(<Pensjonsopptjening />);
    expect(screen.getByText(/Ingen pensjonsopptjening registrert/)).toBeDefined();
  });

  it("viser warning-alert ved feil", () => {
    mockState({ status: "ERROR", perioder: [] });
    render(<Pensjonsopptjening />);
    expect(screen.getByText(/Kunne ikke hente pensjonsopptjening/)).toBeDefined();
  });

  it("mapper ukjent kilde-streng til rå-verdi", () => {
    mockState({
      status: "OK",
      perioder: [{ aar: 2024, pgi: 500000, kilde: "ANNEN_KILDE" }],
    });
    render(<Pensjonsopptjening />);
    expect(screen.getByText("ANNEN_KILDE")).toBeDefined();
  });

  it("dispatcher hentPensjonsopptjening på mount når behandlingID > 0", () => {
    mockState({ status: "OK", perioder: [] });
    render(<Pensjonsopptjening />);
    expect(dispatchMock).toHaveBeenCalled();
  });

  it("viser «Pensjonsgivende inntektstype»-kolonnen med inntektTypeDekode fra API", () => {
    mockState({
      status: "OK",
      perioder: [
        {
          aar: 2025,
          pgi: 540000,
          kilde: "SKATT",
          inntektType: "SUM_PI",
          inntektTypeDekode: "Sum pensjonsgivende inntekt",
        },
      ],
    });
    render(<Pensjonsopptjening />);
    expect(screen.getByRole("columnheader", { name: "Pensjonsgivende inntektstype" })).toBeDefined();
    expect(screen.getByText("Sum pensjonsgivende inntekt")).toBeDefined();
  });

  it("faller tilbake til inntektType-koden når dekode mangler", () => {
    mockState({
      status: "OK",
      perioder: [{ aar: 2025, pgi: 540000, kilde: "SKATT", inntektType: "SUM_PI" }],
    });
    render(<Pensjonsopptjening />);
    expect(screen.getByText("SUM_PI")).toBeDefined();
  });
});
