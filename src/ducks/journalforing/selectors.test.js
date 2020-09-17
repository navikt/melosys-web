import * as selectors from './selectors';
import * as DucksTestUtils from '../test-utils';

import MKV from '../../melosyskodeverk';

import { STATUS } from '../../services/utils';

describe('Journalforingselectors', () => {
  describe('FeilmeldingSelector', () => {
    it('feilmelding fra response ved 400-feil', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          status: 'ERROR',
          data: {
            data: {
              status: 400,
              message: 'Funksjonell feil',
            },
          },
        },
      });

      const [feilmelding] = selectors.FeilmeldingSelector(state);
      expect(feilmelding.innhold).toEqual('Funksjonell feil');
    });

    it('generisk feilmelding ved 500-feil', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          status: 'ERROR',
          data: {
            data: {
              status: 500,
              message: 'Melding som ikke blir brukt',
            },
          },
        },
      });

      const [feilmelding] = selectors.FeilmeldingSelector(state);
      expect(feilmelding.tittel).toEqual('Teknisk feil');
    });

    it('tom liste ved ingen feil', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          status: 'OK',
          data: {
            data: {},
          },
        },
      });

      const feilmelding = selectors.FeilmeldingSelector(state);
      expect(feilmelding).toHaveLength(0);
    });
  });

  describe('FeilkoderSelector', () => {
    it('returnerer feilkoder ved status ERROR', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          data: {
            data: {
              feilkoder: [],
            },
          },
          status: STATUS.ERROR,
        },
      });

      const forventetResultat = state.journalforing.data.data.feilkoder;

      expect(selectors.FeilkoderSelector(state)).toBe(forventetResultat);
    });

    it('returnerer tom array ved status OK', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          data: {
            data: {
              feilkoder: [
                {
                  kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.OVERLAPPENDE_MEDL_PERIODER,
                  felter: [],
                },
                {
                  kode: MKV.Koder.begrunnelser.kontroll_begrunnelser.MANGLENDE_BOSTEDSADRESSE,
                  felter: [],
                },
              ],
            },
          },
          status: STATUS.OK,
        },
      });

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });

    it('returnerer tom array ved feilkoder undefined', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          data: {
            data: {},
          },
          status: STATUS.ERROR,
        },
      });

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });

    it('returnerer tom array ved data undefined', () => {
      const state = DucksTestUtils.lagState({
        journalforing: {
          data: {},
          status: STATUS.ERROR,
        },
      });

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });
  });
});
