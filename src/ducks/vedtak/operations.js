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
import MKV from "../../melosyskodeverk";

import { modalerOperations } from "../modaler";
import { navigeringOperations } from "../navigering";

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
        dispatch(navigeringOperations.tilForsiden());
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
        dispatch(navigeringOperations.tilForsiden());
      },
    }
  );
}

export function kontroller(behandlingID, skalRegisteropplysningerOppdateres, data) {
  return doThenDispatch(() => Api.Saksflyt.Vedtak.kontroller(behandlingID, skalRegisteropplysningerOppdateres, data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function avslaaSoknad(behandlingID, data) {
  const body = {
    behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL,
    fritekst: data.fritekst || null,
    fritekstSed: null,
    mottakerinstitusjoner: [],
    vedtakstype: MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    nyVurderingBakgrunn: null,
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
    }
  );
}
