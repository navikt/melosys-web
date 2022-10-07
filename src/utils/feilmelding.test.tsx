import { mount } from "enzyme";
import { syncErrorsTilFeilmelding } from "./feilmelding";

describe("syncErrorsTilFeilmelding", () => {
  test("Vanlige sync-errors blir mappet riktig", () => {
    const syncErrors = {
      gatenavn: {
        melding: "Mangler gatenavn",
      },
      postkode: {
        melding: "Mangler postkode",
      },
    };

    // @ts-ignore
    const feilmeldinger = mount(syncErrorsTilFeilmelding(syncErrors));
    const feilmeldingListe = feilmeldinger.find("li");

    expect(feilmeldingListe).toHaveLength(2);
    expect(feilmeldingListe.get(0).props.children).toBe("Mangler gatenavn");
    expect(feilmeldingListe.get(1).props.children).toBe("Mangler postkode");
  });

  test("form-wide errors blir mappet riktig", () => {
    const syncErrors = {
      adresse: {
        _error: {
          melding: "Mangler gatenavn",
        },
      },
    };

    // @ts-ignore
    const feilmeldinger = mount(syncErrorsTilFeilmelding(syncErrors));
    const feilmeldingListe = feilmeldinger.find("li");

    expect(feilmeldingListe).toHaveLength(1);
    expect(feilmeldingListe.get(0).props.children).toBe("Mangler gatenavn");
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

    // @ts-ignore
    const feilmeldinger = mount(syncErrorsTilFeilmelding(syncErrors));
    const feilmeldingListe = feilmeldinger.find("li");

    expect(feilmeldingListe).toHaveLength(2);
    expect(feilmeldingListe.get(0).props.children).toBe("Mangler postnr");
    expect(feilmeldingListe.get(1).props.children).toBe("Mangler poststed");
  });
});
