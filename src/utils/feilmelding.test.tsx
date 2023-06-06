import { render, screen } from "@testing-library/react";
import { syncErrorsTilFeilmelding } from "./feilmelding";

describe("syncErrorsTilFeilmelding", () => {
  test("Vanlige sync-errors blir mappet riktig", async () => {
    const syncErrors = {
      gatenavn: {
        melding: "Mangler gatenavn",
      },
      postkode: {
        melding: "Mangler postkode",
      },
    };
    render(syncErrorsTilFeilmelding(syncErrors));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items.at(0)?.textContent).toBe("Mangler gatenavn");
    expect(items.at(1)?.textContent).toBe("Mangler postkode");
  });

  test("form-wide errors blir mappet riktig", () => {
    const syncErrors = {
      adresse: {
        _error: {
          melding: "Mangler gatenavn",
        },
      },
    };
    render(syncErrorsTilFeilmelding(syncErrors));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items.at(0)?.textContent).toBe("Mangler gatenavn");
  });

  test("nested errors blir mappet riktig", () => {
    const syncErrors = {
      adresse: {
        postnr: {
          melding: "Mangler postnr",
        },
        poststed: {
          melding: "Mangler poststed",
        },
      },
    };
    render(syncErrorsTilFeilmelding(syncErrors));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items.at(0)?.textContent).toBe("Mangler postnr");
    expect(items.at(1)?.textContent).toBe("Mangler poststed");
  });
});
