/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { push } from 'connected-react-router';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import MKV from '../../melosyskodeverk';

import { modalerOperations } from '../modaler';

const vedtakValideringFeilet = data => data.feilkoder && data.feilkoder.length > 0;

/* eslint-disable import/prefer-default-export */
export function fatt(behandlingID, body) {
  return doThenDispatch(
    () => Api.Saksflyt.Vedtak.fatt(behandlingID, body),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: dispatch => {
        dispatch(modalerOperations.skjulValidering());
        dispatch(push('/'));
      },
      error: (dispatch, data) => {
        if (vedtakValideringFeilet(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function avslaSoknad(behandlingID) {
  return doThenDispatch(
    () => Api.Saksflyt.Vedtak.fatt(behandlingID, {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL,
      fritekst: null,
      mottakerinstitusjon: null,
      vedtakstype: MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: null,
    }),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: dispatch => {
        dispatch(modalerOperations.skjulAvslagSoknad());
        dispatch(push('/'));
      },
      error: (dispatch, data) => {
        if (vedtakValideringFeilet(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}
