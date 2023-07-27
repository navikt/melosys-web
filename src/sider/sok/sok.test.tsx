import { screen } from "@testing-library/react";

import * as Utils from "../../utils";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";

import { Sok, SokProps } from "./sok";

// TODO: Skriv om når aksel tas inn i prosjektet. MELOSYS-6021
describe.skip("Sok", () => {
  let props: SokProps;

  const getItemPrototype = Storage.prototype.getItem;

  beforeEach(() => {
    props = {
      sokResultat: [],
      sok: vi.fn(),
      hentLandkoder: () => Promise.resolve(),
      landkoder: [],
    };
  });

  afterAll(() => {
    Storage.prototype.getItem = getItemPrototype;
  });

  it("viser en sorterbarliste ved søk på fnr med flere resultat", () => {
    const generator = new Utils.testhelpers.Generator();
    Storage.prototype.getItem = vi.fn(() => generator.generateBirthNumber());
    props.sokResultat = [
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
    renderWithProviders(<Sok {...props} />, { preloadedState: {} });

    const overskrifter = screen.getAllByRole("heading");
    expect(overskrifter).toHaveLength(4);
    expect(overskrifter.at(0)?.textContent).toContain("Saksoversikt");
    expect(overskrifter.at(1)?.textContent).toContain("Resultater for f.nr./d-nr.");
    expect(overskrifter.at(2)?.textContent).toBe("A1 - A2");
    expect(overskrifter.at(3)?.textContent).toBe("B1 - B2");
  });

  it("viser ikke sorterbarliste ved søk på fnr uten resultat", () => {
    const generator = new Utils.testhelpers.Generator();
    Storage.prototype.getItem = vi.fn(() => generator.generateBirthNumber());

    renderWithProviders(<Sok {...props} />, { preloadedState: {} });

    const overskrifter = screen.getAllByRole("heading");
    expect(overskrifter).toHaveLength(2);
    expect(overskrifter.at(0)?.textContent).toContain("Saksoversikt");
    expect(overskrifter.at(1)?.textContent).toContain("Resultater for f.nr./d-nr.");
  });
});
