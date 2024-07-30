import { screen } from "@testing-library/react";

import * as Utils from "../../utils";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

import { Sok } from "./sok";

const generator = new Utils.testhelpers.Generator();
describe("Sok", () => {
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
    // @ts-ignore
    fetch.resetMocks();
    // @ts-ignore
    fetch.mockResponse(JSON.stringify({}));
    const fnr = generator.generateBirthNumber();
    console.log(fnr);
    window.sessionStorage.setItem("sokefrase", JSON.stringify(fnr));
  });

  afterAll(() => {
    window.sessionStorage.clear();
    // @ts-ignore
    fetch.resetMocks();
  });

  it("viser en sorterbarliste ved søk på fnr med flere resultat", () => {
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
    renderWithProviders(<Sok />, { preloadedState: initialStore(sokResultat) });

    const overskrifter = screen.getAllByRole("heading");
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
