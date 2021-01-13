/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { AppThunk } from "AppTypes";
import { BrevPdfData, SedPdfData } from "Domene";

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

async function getObjectURL(response: Response): Promise<string> {
  const arrayBuffer = await response.arrayBuffer();
  const file = new Blob([arrayBuffer], { type: "application/pdf" });
  return URL.createObjectURL(file);
}

export async function forhandsvisBrev(behandlingID: number, dokumenttypeKode: string, data: BrevPdfData) {
  const utfyltdata = {
    mottaker: data.mottaker ? data.mottaker : null,
    fritekst: data.fritekst ? data.fritekst : null,
    begrunnelseKode: data.begrunnelseKode ? data.begrunnelseKode : null,
    ytterligereInformasjon: data.ytterligereInformasjon ? data.ytterligereInformasjon : null,
  };

  const response = await Api.Dokumenter.pdf.forhandsvisBrev(behandlingID, dokumenttypeKode, utfyltdata);

  if (response.ok) {
    return getObjectURL(response);
  }
  return false;
}

export async function forhandsvisSed(behandlingID: number, sedType: string, data: SedPdfData) {
  const vilSendeAnmodningOmMerInformasjon =
    data.vilSendeAnmodningOmMerInformasjon || (data.vilSendeAnmodningOmMerInformasjon === false ? false : null);

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

export function resetDokument(): AppThunk<Types.Action, Types.Action> {
  return (dispatch) => dispatch(Actions.reset());
}

export function hentDokumentOversikt(saksnummer: string): AppThunk<Promise<Types.Action>, Types.Action> {
  return doThenDispatch(
    () => Api.Dokumenter.dokument.hentOversikt(saksnummer),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      mapDispatchData: (data: any) => ({
        dokumentOversikt: data,
      }),
    }
  );
}
