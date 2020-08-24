import * as Utils from './index';

import MKV from '../../melosyskodeverk';

describe('Utils', () => {
  describe('valideringFeilet', () => {
    it('returnerer true hvis det finnes minst en feilkode', () => {
      const data = {
        feilkoder: [
          {
            kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
            felter: [],
          },
        ],
      };

      expect(Utils.valideringFeilet(data)).toBe(true);
    });

    it('returnerer false hvis det ikke finnes feilkoder', () => {
      const data = {
        feilkoder: [],
      };

      expect(Utils.valideringFeilet(data)).toBe(false);
    });
  });

  describe('harFeilmelding', () => {
    it('returnerer message hvis det finnes message', () => {
      const data = {
        message: 'Journalføring feilet',
      };

      expect(Utils.harFeilmelding(data)).toBe(data.message);
    });

    it('returnerer undefined hvis det ikke finnes message', () => {
      const data = {};

      expect(Utils.harFeilmelding(data)).toBe(undefined);
    });
  });
});
