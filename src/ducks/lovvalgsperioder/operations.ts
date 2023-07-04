/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

import { doThenDispatch } from "../../services/utils";
import { behandlingerSelectors } from "../behandlinger";
import { oppdaterLovvalgsperioderState as byggOgOppdaterLovvalgsperioder } from "./byggLovvalgsperioder";

export function hent(behandlingID: number) {
  return doThenDispatch(() => Api.Lovvalgsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID: number, body: Api.Lovvalgsperioder.Lovvalgsperiode[]) {
  return doThenDispatch(() => Api.Lovvalgsperioder.send(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettLovvalgsperiode(behandlingID: number, body: Api.Lovvalgsperioder.OpprettLovvalgsperiode) {
  return doThenDispatch(() => Api.Lovvalgsperioder.opprettLovvalgsperiode(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagre() {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());
    const lovvalgsperioder = Selectors.LovvalgsperioderSelector(getState());

    return dispatch(send(behandlingID, lovvalgsperioder));
  };
}

export function oppdaterLovvalgsperioder(lovvalgsperioder: Api.Lovvalgsperioder.Lovvalgsperiode[]) {
  return Actions.oppdaterLovvalgsperioderState(lovvalgsperioder);
}

export function resetLovvalgsperioderState() {
  return Actions.resetLovvalgsperioderState();
}

export function endreLovvalgsPeriode(fomdato: String, tomdato?: String) {
  return Actions.endrePeriode(fomdato, tomdato);
}

export function oppdaterLovvalgsperioderState(stegState: any) {
  return byggOgOppdaterLovvalgsperioder(stegState);
}
