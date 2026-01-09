/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { ThunkDispatch } from "redux-thunk";
import { AppThunk, RootState } from "AppTypes";

import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

import { doThenDispatch } from "../../services/utils";
import { behandlingerSelectors } from "../behandlinger";
import { oppdaterLovvalgsperioderState as byggOgOppdaterLovvalgsperioder } from "./byggLovvalgsperioder";
import { PerioderStegState } from "../../felleskomponenter/stegvelger";

export function hent(behandlingID: number) {
  return doThenDispatch(() => Api.Lovvalgsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

/**
 * send
 * OBS: Bruk heller opprettLovvalgsperiode og oppdaterLovvalgsperiode dersom du utvikler noe nytt
 */
export function send(behandlingID: number, body: Api.Lovvalgsperioder.LovvalgsperiodeDto[]) {
  return doThenDispatch(() => Api.Lovvalgsperioder.send(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettLovvalgsperiode(
  behandlingID: number,
  body: Api.Lovvalgsperioder.OpprettLovvalgsperiode,
): AppThunk<Promise<Types.OkAction>, Types.OkAction> {
  return doThenDispatch(() => Api.Lovvalgsperioder.opprettLovvalgsperiode(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterLovvalgsperiode(
  behandlingID: number,
  lovvalgsperiodeID: number,
  body: Api.Lovvalgsperioder.LovvalgsperiodeDto,
): AppThunk<Promise<Types.OppdaterLovvalgsperioderAction>, Types.OppdaterLovvalgsperioderAction> {
  return doThenDispatch(() => Api.Lovvalgsperioder.oppdaterLovvalgsperiode(behandlingID, lovvalgsperiodeID, body), {
    OK: Types.OK_OPPDATER_LOVVALGSPERIODE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function slettLovvalgsperiode(behandlingID: number, lovvalgsperiodeID: number) {
  return doThenDispatch(
    () => Api.Lovvalgsperioder.slettLovvalgsperiode(behandlingID, lovvalgsperiodeID),
    {
      OK: Types.OK_SLETT_LOVVALGSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      mapDispatchData: () => ({
        periodeID: lovvalgsperiodeID,
      }),
    },
  );
}

export function lagre() {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());
    const lovvalgsperioder = Selectors.LovvalgsperioderSelector(getState());

    return dispatch(send(behandlingID, lovvalgsperioder));
  };
}

export function resetLovvalgsperioderState() {
  return Actions.resetLovvalgsperioderState();
}

export function endreLovvalgsPeriode(fomdato: string, tomdato?: string) {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) => {
    return new Promise<void>((resolve) => {
      dispatch(Actions.endrePeriode(fomdato, tomdato));
      resolve();
    });
  };
}

export function oppdaterLovvalgsperioderState(stegState: PerioderStegState) {
  return byggOgOppdaterLovvalgsperioder(stegState);
}
