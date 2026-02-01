import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../melosyskodeverk";

vi.mock("../../navFrontend", () => ({
  Tag: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
  Table: Object.assign(({ children, ...rest }: any) => <table {...rest}>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../resources/images", () => ({
  Binders: () => null,
}));

vi.mock("../../utils", () => ({
  _uuid: () => "uuid",
}));

vi.mock("../../utils/dato", () => ({
  formatterDatoTilNorsk: (d: string) => d,
}));

vi.mock("../../ducks/dokumenter/selectors", () => ({
  hentDato: (_mr: any, mottatt: string) => mottatt,
}));

vi.mock("../pdfLink", () => ({
  default: ({ tittel }: any) => <a>{tittel}</a>,
}));

vi.mock("./sendBrev/brevutkast/lagredeUtkast", () => ({
  default: () => null,
}));

vi.mock("../../hooks", () => ({
  useAsyncCallbackState: () => [[]],
  useDispatch: () => vi.fn(),
}));

vi.mock("redux-form", () => ({
  change: vi.fn(),
}));

import SideDialogDokumenter from "./sideDialogDokumenter";

describe("SideDialogDokumenter", () => {
  const defaultProps = {
    behandlingID: 1,
    dokumentOversikt: [],
    setAktivTab: vi.fn(),
  };

  it("viser melding når ingen dokumenter", () => {
    render(<SideDialogDokumenter {...defaultProps} />);
    expect(screen.getByText(/ingen dokumenter/i)).toBeDefined();
  });

  it("rendrer tabell med dokumenter", () => {
    const props = {
      ...defaultProps,
      dokumentOversikt: [
        {
          mottattDato: "2024-01-01",
          journalforingDato: "2024-01-02",
          mottaksretning: { kode: MKV.Koder.mottaksretning.INN },
          avsenderEllerMottaker: "NAV",
          journalpostID: "123",
          hoveddokument: { dokumentID: "doc1", tittel: "Søknad", logiskeVedlegg: [] },
          vedlegg: [],
        },
      ],
    };
    render(<SideDialogDokumenter {...props} />);
    expect(screen.getByText("Søknad")).toBeDefined();
    expect(screen.getByText("NAV")).toBeDefined();
  });

  it("viser MottaksretningIkon med riktig MKV-kode", () => {
    const props = {
      ...defaultProps,
      dokumentOversikt: [
        {
          mottattDato: "2024-01-01",
          journalforingDato: "2024-01-02",
          mottaksretning: { kode: MKV.Koder.mottaksretning.INN },
          avsenderEllerMottaker: "Bruker",
          journalpostID: "123",
          hoveddokument: { dokumentID: "doc1", tittel: "Dok", logiskeVedlegg: [] },
          vedlegg: [],
        },
      ],
    };
    render(<SideDialogDokumenter {...props} />);
    expect(screen.getByText("inn")).toBeDefined();
  });

  it("viser 'ut' for UT mottaksretning", () => {
    const props = {
      ...defaultProps,
      dokumentOversikt: [
        {
          mottattDato: "2024-01-01",
          journalforingDato: "2024-01-02",
          mottaksretning: { kode: MKV.Koder.mottaksretning.UT },
          avsenderEllerMottaker: "Bruker",
          journalpostID: "456",
          hoveddokument: { dokumentID: "doc2", tittel: "Vedtak", logiskeVedlegg: [] },
          vedlegg: [],
        },
      ],
    };
    render(<SideDialogDokumenter {...props} />);
    expect(screen.getByText("ut")).toBeDefined();
  });
});
