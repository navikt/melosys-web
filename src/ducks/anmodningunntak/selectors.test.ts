import { mock, instance } from 'ts-mockito';
import { RootState } from 'AppTypes';

import * as selectors from './selectors';

import MKV from '../../melosyskodeverk';

import { STATUS } from '../../services/utils';

describe('AnmodningOmUnntakselectors', () => {
  describe('FeilkoderSelector', () => {
    it('returnerer feilkoder ved status ERROR', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.anmodningomunntak = {
        data: {
          data: {
            feilkoder: [],
            error: 'Valideringsfeil',
            status: 404,
            message: 'Valideringsfeil',
          },
        },
        status: STATUS.ERROR,
      };

      const forventetResultat = state.anmodningomunntak.data.data && state.anmodningomunntak.data.data.feilkoder;

      expect(selectors.FeilkoderSelector(state)).toBe(forventetResultat);
    });

    it('returnerer tom array ved status OK', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.anmodningomunntak = {
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
            error: 'Valideringsfeil',
            status: 404,
            message: 'Valideringsfeil',
          },
        },
        status: STATUS.OK,
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });

    it('returnerer tom array ved feilkoder undefined', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.anmodningomunntak = {
        data: {
          data: {
            error: 'Valideringsfeil',
            status: 404,
            message: 'Valideringsfeil',
          },
        },
        status: STATUS.ERROR,
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });

    it('returnerer tom array ved data undefined', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.anmodningomunntak = {
        data: {},
        status: STATUS.ERROR,
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });
  });
});
