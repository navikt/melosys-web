/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as DucksUtils from "../utils";
import MKV from "../../melosyskodeverk";

import { modalerOperations } from "../modaler";
import { navigeringOperations } from "../navigering";

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
      success: (dispatch) => {
        dispatch(modalerOperations.skjulValidering());
        dispatch(navigeringOperations.tilForsiden());
      },
      error: (dispatch, data) => {
        if (DucksUtils.harFeilkode(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function endre(behandlingID, body) {
  return doThenDispatch(
    () => Api.Saksflyt.Vedtak.endre(behandlingID, body),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch) => {
        dispatch(modalerOperations.skjulValidering());
        dispatch(navigeringOperations.tilForsiden());
      },
      error: (dispatch, data) => {
        if (DucksUtils.harFeilkode(data) && DucksUtils.harFeilmelding(data)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}

export function avslaSoknad(behandlingID, data) {
  const body = {
    behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL,
    fritekst: data.fritekst || null,
    fritekstSed: null,
    mottakerinstitusjoner: [],
    vedtakstype: MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    revurderBegrunnelse: null,
  };

  return doThenDispatch(
    () => Api.Saksflyt.Vedtak.fatt(behandlingID, body),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch) => {
        dispatch(modalerOperations.skjulAvslagSoknad());
        dispatch(navigeringOperations.tilForsiden());
      },
      error: (dispatch, errorData) => {
        if (DucksUtils.harFeilkode(errorData)) {
          dispatch(modalerOperations.visValidering());
        }
      },
    }
  );
}
