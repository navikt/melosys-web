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

  test("returnerer null for null feil-verdi", () => {
    const syncErrors = {
      felt1: null,
    };
    // @ts-expect-error testing null case
    render(syncErrorsTilFeilmelding(syncErrors));
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  test("viser 'Noe gikk galt' for uventet feiltype", () => {
    const syncErrors = {
      felt1: "en ren streng uten melding-property",
    };
    render(syncErrorsTilFeilmelding(syncErrors));
    const items = screen.getAllByRole("listitem");
    expect(items.some((item) => item.textContent === "Noe gikk galt")).toBe(true);
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
    // @ts-expect-error generisk beskrivelse
    render(syncErrorsTilFeilmelding(syncErrors));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items.at(0)?.textContent).toBe("Mangler postnr");
    expect(items.at(1)?.textContent).toBe("Mangler poststed");
  });
});
