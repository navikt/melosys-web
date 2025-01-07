import { screen } from "@testing-library/react";

import * as Utils from "../../utils";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

import { Sok } from "./sok";

const generator = new Utils.testhelpers.Generator();
describe("Sok", () => {
  let fnr;
  const initialStore = (sokResultat: object[] = []) => ({
    sok: {
      status: "",
      data: {
        fagsakListe: sokResultat,
      },
    },
    landkoder: {
      status: "",
      data: [],
    },
  });

  beforeAll(() => {
    // @ts-expect-error generisk beskrivelse
    fetch.resetMocks();
    // @ts-expect-error generisk beskrivelse
    fetch.mockResponse(JSON.stringify({}));
    fnr = generator.generateBirthNumber();
    vi.spyOn(window.sessionStorage, "getItem").mockReturnValue(fnr);
  });

  afterAll(() => {
    // @ts-expect-error generisk beskrivelse
    fetch.resetMocks();
    vi.clearAllMocks();
  });

  it("viser en sorterbarliste ved søk på fnr med flere resultat", async () => {
    const sokResultat = [
      {
        sakstype: { term: "A1" },
        sakstema: { term: "A2" },
        behandlingOversikter: [],
      },
      {
        sakstype: { term: "B1" },
        sakstema: { term: "B2" },
        behandlingOversikter: [],
      },
    ];

    const { findAllByRole } = renderWithProviders(<Sok />, { preloadedState: initialStore(sokResultat) });

    const overskrifter = await findAllByRole("heading");
    expect(overskrifter).toHaveLength(4);
    expect(overskrifter.at(0)?.textContent).toContain("Saksoversikt");
    expect(overskrifter.at(1)?.textContent).toContain("Resultater for f.nr./d-nr.");
    expect(overskrifter.at(2)?.textContent).toBe("A1 - A2");
    expect(overskrifter.at(3)?.textContent).toBe("B1 - B2");
  });

  it("viser ikke sorterbarliste ved søk på fnr uten resultat", () => {
    renderWithProviders(<Sok />, { preloadedState: initialStore() });

    const overskrifter = screen.getAllByRole("heading");
    expect(overskrifter).toHaveLength(2);
    expect(overskrifter.at(0)?.textContent).toContain("Saksoversikt");
    expect(overskrifter.at(1)?.textContent).toContain("Resultater for f.nr./d-nr.");
  });
});
