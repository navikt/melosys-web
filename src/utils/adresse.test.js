import { erRegisterAdresseObjektTomt, erStrukturertAdresseObjektTomt } from "./adresse";

describe("erRegisterAdresseObjektTomt", () => {
  let adresseObjekt = null;

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
  let adresseObjekt = {};

  beforeEach(() => {
    adresseObjekt = {};
  });

  it("Returnerer true for et tomt adresseobjekt", () => {
    expect(erStrukturertAdresseObjektTomt(adresseObjekt)).toBe(true);
  });

  it("Returnerer false for et adresseobjekt som har gatenavn", () => {
    adresseObjekt.gatenavn = "0000";

    expect(erStrukturertAdresseObjektTomt(adresseObjekt)).toBe(false);
  });
});
