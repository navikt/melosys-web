import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

vi.mock("react-redux", () => ({
  connect: () => (comp: any) => comp,
}));

vi.mock("redux-form", () => ({
  change: vi.fn(),
}));

vi.mock("../../../resources/images", () => ({
  FindAccount: () => <span>ikon</span>,
}));

vi.mock("../../../navFrontend", () => ({
  RadioGroup: ({ children, legend }: any) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  ),
  Radio: ({ children, value }: any) => (
    <label>
      <input type="radio" value={value} readOnly />
      {children}
    </label>
  ),
}));

vi.mock("@navikt/ds-react", () => ({
  HStack: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("./komponent", () => ({
  default: ({ tittel, innhold }: any) => (
    <div>
      <h2>{tittel}</h2>
      {innhold}
    </div>
  ),
}));

vi.mock("../../../felleskomponenter/enkelNavBox", () => ({
  EnkelNavBox: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../ducks/form", () => ({
  formSelectors: {
    JournalforingFormSelector: () => ({ values: {} }),
  },
}));

vi.mock("../../../ducks/journalforing", () => ({
  journalforingSelectors: {
    BrukerIDSelector: () => "123",
    VirksomhetOrgnrSelector: () => "987654321",
  },
}));

import JournalforingGjelder from "./journalforingGjelder";

const Component = JournalforingGjelder as any;

describe("JournalforingGjelder", () => {
  it("rendrer tittel", () => {
    render(
      <Component
        journalforingGjelder={BRUKER}
        oppdaterFelt={vi.fn()}
        journalpostBrukerID="123"
        journalpostVirksomhetOrgnr="987"
      />,
    );
    expect(screen.getByText("Hvem skal dokumentet journalføres på?")).toBeDefined();
  });

  it("viser MKV-baserte radioknapper for BRUKER og VIRKSOMHET", () => {
    render(
      <Component
        journalforingGjelder={BRUKER}
        oppdaterFelt={vi.fn()}
        journalpostBrukerID="123"
        journalpostVirksomhetOrgnr="987"
      />,
    );
    const brukerTerm = KV.kodeTilTerm(BRUKER, MKV.KTObjects.aktoersroller);
    const virksomhetTerm = KV.kodeTilTerm(VIRKSOMHET, MKV.KTObjects.aktoersroller);
    expect(screen.getByText(brukerTerm)).toBeDefined();
    expect(screen.getByText(virksomhetTerm)).toBeDefined();
  });

  it("har radio-inputs med korrekte MKV-verdier", () => {
    const { container } = render(
      <Component
        journalforingGjelder={BRUKER}
        oppdaterFelt={vi.fn()}
        journalpostBrukerID="123"
        journalpostVirksomhetOrgnr="987"
      />,
    );
    const radios = container.querySelectorAll("input[type='radio']");
    const values = Array.from(radios).map((r) => r.getAttribute("value"));
    expect(values).toContain(BRUKER);
    expect(values).toContain(VIRKSOMHET);
  });
});
