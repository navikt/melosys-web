import { mock, instance } from 'ts-mockito';
import { RootState } from 'AppTypes';

import * as selectors from './selectors';

import MKV from '../../melosyskodeverk';
import { STATUS } from '../../services/utils';

describe('Videresendingselectors', () => {
  describe('FeilmeldingSelector', () => {
    it('feilmelding fra response ved 400-feil', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.videresending = {
        status: 'ERROR',
        data: {
          data: {
            status: 400,
            message: 'Funksjonell feil',
            feilkoder: [],
            error: 'Funksjonell feil',
          },
        },
      };

      const [feilmelding] = selectors.FeilmeldingSelector(state);
      expect(feilmelding.innhold).toEqual('Funksjonell feil');
    });

    it('generisk feilmelding ved 500-feil', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.videresending = {
        status: 'ERROR',
        data: {
          data: {
            status: 500,
            message: 'Melding som ikke blir brukt',
            feilkoder: [],
            error: 'Funksjonell feil',
          },
        },
      };

      const [feilmelding] = selectors.FeilmeldingSelector(state);
      expect(feilmelding.tittel).toEqual('Teknisk feil');
    });

    it('tom liste ved ingen feil', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.videresending = {
        status: 'OK',
        data: {},
      };

      const feilmelding = selectors.FeilmeldingSelector(state);
      expect(feilmelding).toHaveLength(0);
    });
  });

  describe('FeilkoderSelector', () => {
    it('returnerer feilkoder ved status ERROR', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.videresending = {
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

      const forventetResultat = state.videresending.data.data && state.videresending.data.data.feilkoder;

      expect(selectors.FeilkoderSelector(state)).toBe(forventetResultat);
    });

    it('returnerer tom array ved status OK', () => {
      const mockedState = mock<RootState>();
      const state = instance(mockedState);
      state.videresending = {
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
      state.videresending = {
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
      state.videresending = {
        data: {},
        status: STATUS.ERROR,
      };

      expect(selectors.FeilkoderSelector(state)).toEqual([]);
    });
  });
});
