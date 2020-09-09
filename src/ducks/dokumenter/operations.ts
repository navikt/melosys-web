/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { ThunkDispatch } from 'redux-thunk';
import { AppThunk, RootState } from 'AppTypes';

import { doThenDispatch } from '../../services/utils';
import { BrevbestillingDto } from '../../services/modules/dokumenter/dokument';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Actions from './actions';

export async function opprettDokument(behandlingID: number, dokumenttypeKode: string, dokument: BrevbestillingDto): Promise<void> {
  return Api.Dokumenter.dokument.opprett(behandlingID, dokumenttypeKode, dokument);
}

async function getObjectURL(response: any): Promise<string> {
  const arrayBuffer = await response.arrayBuffer();
  const file = new Blob([arrayBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(file);
}

export async function forhandsvisBrev(behandlingID: number, dokumenttypeKode: any, data: {} | any) {
  const utfyltdata = {
    mottaker: data.mottaker ? data.mottaker : null,
    fritekst: data.fritekst ? data.fritekst : null,
    begrunnelseKode: data.begrunnelseKode ? data.begrunnelseKode : null,
  };

  const response = await Api.Dokumenter.pdf.forhandsvisBrev(behandlingID, dokumenttypeKode, utfyltdata);

  if (response.ok) {
    return getObjectURL(response);
  }
  return false;
}

export async function forhandsvisSed(behandlingID: number, sedType: string, data: any) {
  const vilSendeAnmodningOmMerInformasjon = data.vilSendeAnmodningOmMerInformasjon || (data.vilSendeAnmodningOmMerInformasjon === false ? false : null);

  const utfyltdata = {
    fritekst: data.fritekst || null,
    nyttLovvalgsland: data.nyttLovvalgsland || null,
    begrunnelseUtenlandskMyndighet: data.begrunnelseUtenlandskMyndighet || null,
    vilSendeAnmodningOmMerInformasjon,
  };

  const response = await Api.Dokumenter.pdf.forhandsvisSed(behandlingID, sedType, utfyltdata);

  if (response.ok) {
    return getObjectURL(response);
  }
  return false;
}

export function resetDokument(): (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) => Types.Action {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) => (dispatch(Actions.reset()));
}

export function hentDokumentOversikt(saksnummer: string): AppThunk<Promise<Types.Action>, Types.Action> {
  return doThenDispatch(() => Api.Dokumenter.dokument.hentOversikt(saksnummer), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  }, {
    mapDispatchData: (data: any) => ({
      dokumentOversikt: data,
    }),
  });
}
