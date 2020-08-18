import * as selectors from './selectors';

import { STATUS } from '../../services/utils';

describe('vedtak selectors', () => {
  const lagState = ({ data, status }) => ({
    vedtak: {
      data,
      status,
    },
  });

  describe('FeilkoderSelector', () => {
    it('returnerer feilkoder ved status ERROR', () => {
      const state = lagState({
        data: {
          data: {
            feilkoder: [],
          },
        },
        status: STATUS.ERROR,
      });

      const forventetResultat = state.vedtak.data.data.feilkoder;

      expect(selectors.FeilkoderSelector(state)).toBe(forventetResultat);
    });

    it('returnerer tom array ved status OK', () => {
      const state = lagState({
        data: {
          data: {
            feilkoder: [],
          },
        },
        status: STATUS.OK,
      });

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });
  });
});
