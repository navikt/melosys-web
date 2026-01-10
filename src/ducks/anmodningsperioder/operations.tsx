/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import MKV from "../../melosyskodeverk";

import * as Api from "../../services/api";
import { doThenDispatch } from "../../services/utils";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

import { mottatteOpplysningerSelectors } from "../mottatteOpplysninger";
import { lovvalgsperioderSelectors } from "../lovvalgsperioder";
import { behandlingerSelectors } from "../behandlinger";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { PerioderStegState } from "../../felleskomponenter/stegvelger";

export function hent(behandlingID: number) {
  return doThenDispatch(() => Api.Anmodningsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID: number, anmodningsperioder: Api.Anmodningsperioder.Anmodningsperioder) {
  return doThenDispatch(() => Api.Anmodningsperioder.send(behandlingID, anmodningsperioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagre() {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    const anmodningsperioderErSendtUtlandet = Selectors.AnmodningsperioderErSendtUtlandetSelector(getState());
    if (anmodningsperioderErSendtUtlandet) return null;

    const anmodningsperioder = Selectors.AnmodningsperioderSelector(
      getState(),
    ) as Api.Anmodningsperioder.Anmodningsperiode[];
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());

    return dispatch(
      send(behandlingID, {
        anmodningsperioder: anmodningsperioder.map(
          ({ sendtUtland, ...beholdProperties }: Api.Anmodningsperioder.Anmodningsperiode) => beholdProperties,
        ),
      }),
    );
  };
}

const byggAnmodningsperiode = (
  stegState: PerioderStegState,
  reduxState: RootState,
): Api.Anmodningsperioder.Anmodningsperiode[] => {
  const søknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(reduxState);
  const soknadsland = mottatteOpplysningerSelectors.SoknadslandkoderSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);
  return [
    {
      id: null,
      fomDato: søknadsperiode.fom,
      tomDato: søknadsperiode.tom,
      lovvalgBestemmelse: stegState.lovvalgsbestemmelse,
      tilleggBestemmelse: stegState.tilleggbestemmelse,
      lovvalgsland: MKV.Koder.landkoder.NO,
      unntakFraBestemmelse: stegState.unntakfrabestemmelse,
      unntakFraLovvalgsland: soknadsland.join(""),
      medlemskapsperiodeID: medlemskapsperiodeID || null,
      trygdedekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    },
  ];
};

const byggAnmodningsperioder = (
  stegState: PerioderStegState,
  reduxState: RootState,
): Api.Anmodningsperioder.Anmodningsperiode[] => {
  switch (stegState.lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART18_1:
      return byggAnmodningsperiode(stegState, reduxState);
    default: {
      return [];
    }
  }
};

export function oppdaterAnmodningsperioderState(stegState: PerioderStegState) {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    const anmodningsperioderErSendtUtland = Selectors.AnmodningsperioderErSendtUtlandetSelector(getState());
    if (anmodningsperioderErSendtUtland) return;

    if (stegState.lovvalgsbestemmelse || stegState.tilleggbestemmelse || stegState.unntakfrabestemmelse) {
      const anmodningsperioder = byggAnmodningsperioder(stegState, getState());
      dispatch(Actions.oppdaterAnmodningsperioder(anmodningsperioder));
    } else {
      dispatch(Actions.resetAnmodningsperioderState());
    }
  };
}

export function resetAnmodningsperioderState() {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) =>
    dispatch(Actions.resetAnmodningsperioderState());
}
