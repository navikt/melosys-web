import { erRegisterAdresseObjektTomt, erStrukturertAdresseObjektTomt } from "./adresse";
import type { RegisterAdresse, StrukturertAdresse } from "../services/modules/types/adresse";

describe("erRegisterAdresseObjektTomt", () => {
  let adresseObjekt: RegisterAdresse;

  beforeEach(() => {
    adresseObjekt = {
      gateadresse: {
        gatenummer: null,
        husbokstav: null,
        husnummer: null,
        gatenavn: null,
      },
      postnr: null,
      poststed: null,
      land: null,
    };
  });

  it("Returnerer true for et tomt adresseobjekt", () => {
    expect(erRegisterAdresseObjektTomt(adresseObjekt)).toBe(true);
  });

  it("Returnerer false for et adresseobjekt som har postnummer", () => {
    adresseObjekt.postnr = "0000";

    expect(erRegisterAdresseObjektTomt(adresseObjekt)).toBe(false);
  });

  it("Returnerer false for et adresseobjekt som har gatenavn", () => {
    adresseObjekt.gateadresse.gatenavn = "0000";

    expect(erRegisterAdresseObjektTomt(adresseObjekt)).toBe(false);
  });
});

describe("erStrukturertAdresseObjektTomt", () => {
  let adresseObjekt: StrukturertAdresse;

  beforeEach(() => {
    adresseObjekt = {
      tilleggsnavn: null,
      gatenavn: null,
      husnummerEtasjeLeilighet: null,
      region: null,
      postboks: null,
      postnummer: null,
      poststed: null,
      landkode: null,
      coAdressenavn: null,
    };
  });

  it("Returnerer true for et tomt adresseobjekt", () => {
    expect(erStrukturertAdresseObjektTomt(adresseObjekt)).toBe(true);
  });

  it("Returnerer false for et adresseobjekt som har gatenavn", () => {
    adresseObjekt.gatenavn = "0000";

    expect(erStrukturertAdresseObjektTomt(adresseObjekt)).toBe(false);
  });
});
