import Steg from './steg';
import { STEG, FANE_STATUS } from './typer';


describe('Steg', () => {
  class Inngangssteg extends Steg {
    constructor(propslight, posisjon) {
      super(propslight, posisjon);

      this._kriterier = [
        {
          exec: () => false,
          nesteSteg: STEG.ARTIKKEL_13_2_B,
        },
        {
          exec: () => true,
          nesteSteg: STEG.VEDTAK,
        },
      ];

      this.id = STEG.INNGANG;
      this._samleRelevanteData = jest.fn();
      this._beregnRelevantUI = jest.fn();
    }
  }

  describe('byggSteg', () => {
    it('setter status FEIL dersom beregnRelevantUI returnerer null', () => {
      const inngangssteg = new Inngangssteg({}, 1);
      inngangssteg.beregnRelevantUI = jest.fn(() => null);
      const byggetSteg = inngangssteg.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.FEIL);
    });

    it('setter status OK dersom steget har avklaring', () => {
      const inngangssteg = new Inngangssteg({}, 1);
      inngangssteg.beregnRelevantUI = jest.fn(() => ({ harAvklaring: true }));
      const byggetSteg = inngangssteg.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.OK);
    });

    it('setter status UBEHANDLET dersom steget ikke har avklaring', () => {
      const inngangssteg = new Inngangssteg({}, 1);
      inngangssteg.beregnRelevantUI = jest.fn(() => ({ harAvklaring: false }));
      const byggetSteg = inngangssteg.byggSteg();

      expect(byggetSteg.status).toBe(FANE_STATUS.UBEHANDLET);
    });
  });

  describe('nesteSteg', () => {
    it('returnerer første steg med matchende kriterie', () => {
      const inngangssteg = new Inngangssteg({}, 1);
      const nesteSteg = inngangssteg.nesteSteg();

      expect(nesteSteg).toBe(STEG.VEDTAK);
    });
  });
});
