import { erAdresseObjektTomt } from './adresse';


describe('erAdresseObjektTomt', () => {
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

  it('Returnerer true for et tomt adresseobjekt', () => {
    expect(erAdresseObjektTomt(adresseObjekt)).toBe(true);
  });

  it('Returnerer false for et adresseobjekt som har postnummer', () => {
    adresseObjekt.postnr = '0000';

    expect(erAdresseObjektTomt(adresseObjekt)).toBe(false);
  });

  it('Returnerer false for et adresseobjekt som har gatenavn', () => {
    adresseObjekt.gateadresse.gatenavn = '0000';

    expect(erAdresseObjektTomt(adresseObjekt)).toBe(false);
  });
});
