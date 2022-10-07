import * as Validering from "../../felleskomponenter/skjema/validering";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Selectors from "./selectors";

import MKV from "../../melosyskodeverk";

import { erFeatureToggleEnabled } from "../../featuretoggle";
import { doThenDispatch } from "../../services/utils";

import { formSelectors } from "../form";
import { behandlingerSelectors } from "../behandlinger";
import { OrganisasjonOperations } from "../organisasjoner";
import { fagsakSelectors } from "../fagsaker";

export function hent(behandlingID) {
  return async (dispatch, getState) => {
    const doThenDispatchResult = doThenDispatch(() => Api.Behandlingsgrunnlag.hent(behandlingID), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    });
    const dispatchedBehandlingsgrunnlagAction = await doThenDispatchResult(dispatch, getState);

    const ekstraOrganisasjoner = [
      ...Selectors.EkstraArbeidsgivereSelector(getState()),
      ...Selectors.SelvstendigArbeidForetakOrgnumreSelector(getState()),
    ];
    const ekstraOrganisasjonerPromises = ekstraOrganisasjoner.map((orgnr) =>
      dispatch(OrganisasjonOperations.hent(orgnr))
    );
    await Promise.all(ekstraOrganisasjonerPromises);

    return dispatchedBehandlingsgrunnlagAction;
  };
}

export function send(bid, behandlingsgrunnlag) {
  return doThenDispatch(
    () => Api.Behandlingsgrunnlag.send(bid, behandlingsgrunnlag),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch, data) => Validering.Felles.forsokValidering(dispatch, data),
    }
  );
}

const hentOvergangsregelbestemmelser = (values) => (values ? values.overgangsregelbestemmelser : []);

const temaForSedGrunnlag = (behandlingstema) =>
  [
    MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
    MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
  ].includes(behandlingstema);

export function oppdaterState() {
  return (dispatch, getState) => {
    const behandlingsgrunnlagData = {
      ...formSelectors.SoknadenFormSelector(getState()).values,
      ...formSelectors.VurderStartFormSelector(getState()).values,
    };

    const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(getState());
    if (temaForSedGrunnlag(behandlingstema)) {
      behandlingsgrunnlagData.overgangsregelbestemmelser = hentOvergangsregelbestemmelser(
        formSelectors.VurderUtpekingFormSelector(getState()).values
      );
    }

    if (Utils._isEmpty(behandlingsgrunnlagData)) return;

    dispatch(Actions.oppdaterState(behandlingsgrunnlagData));
  };
}

const lagBehandlingsgrunnlagFelter = (behandlingsgrunnlag) => ({
  juridiskArbeidsgiverNorge: behandlingsgrunnlag.juridiskArbeidsgiverNorge,
  personOpplysninger: behandlingsgrunnlag.personOpplysninger,
  foretakUtland: behandlingsgrunnlag.foretakUtland,
  oppholdUtland: behandlingsgrunnlag.oppholdUtland,
  bosted: behandlingsgrunnlag.bosted,
  selvstendigArbeid: behandlingsgrunnlag.selvstendigArbeid,
  soeknadsland: behandlingsgrunnlag.soeknadsland,
  periode: behandlingsgrunnlag.periode,
});

const lagArbeidsstederFelter = (behandlingsgrunnlag) => ({
  arbeidPaaLand: behandlingsgrunnlag.arbeidPaaLand,
  maritimtArbeid: behandlingsgrunnlag.maritimtArbeid,
  luftfartBaser: behandlingsgrunnlag.luftfartBaser,
});

const lagEØSFelter = (behandlingsgrunnlag) => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  ...lagArbeidsstederFelter(behandlingsgrunnlag),
  loennOgGodtgjoerelse: behandlingsgrunnlag.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: behandlingsgrunnlag.arbeidsgiversBekreftelse,
  arbeidssituasjonOgOevrig: behandlingsgrunnlag.arbeidssituasjonOgOevrig,
  utenlandsoppdraget: behandlingsgrunnlag.utenlandsoppdraget,
});

const lagFTRLFelter = (behandlingsgrunnlag) => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  ...lagArbeidsstederFelter(behandlingsgrunnlag),
  loennOgGodtgjoerelse: behandlingsgrunnlag.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: behandlingsgrunnlag.arbeidsgiversBekreftelse,
  trygdedekning: behandlingsgrunnlag.trygdedekning,
});

const lagTrygdeavtaleFelter = (behandlingsgrunnlag) => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  loennOgGodtgjoerelse: behandlingsgrunnlag.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: behandlingsgrunnlag.arbeidsgiversBekreftelse,
  representantIUtlandet: behandlingsgrunnlag.representantIUtlandet,
});

const lagSedGrunnlagFelter = (behandlingsgrunnlag) => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  ...lagArbeidsstederFelter(behandlingsgrunnlag),
  overgangsregelbestemmelser: behandlingsgrunnlag.overgangsregelbestemmelser,
  ytterligereInformasjon: behandlingsgrunnlag.ytterligereInformasjon || null,
});

const lagBehandlingsgrunnlagDataEtterBehandlingstema = (behandlingstema, behandlingsgrunnlag) => {
  switch (behandlingstema) {
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return lagEØSFelter(behandlingsgrunnlag);
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET:
      return lagFTRLFelter(behandlingsgrunnlag);
    case MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV:
      return lagTrygdeavtaleFelter(behandlingsgrunnlag);
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return lagSedGrunnlagFelter(behandlingsgrunnlag);
    default:
      return {};
  }
};

const lagBehandlingsgrunnlagData = (sakstype, behandlingstema, behandlingsgrunnlag) => {
  if (temaForSedGrunnlag(behandlingstema)) {
    return lagSedGrunnlagFelter(behandlingsgrunnlag);
  }

  switch (sakstype) {
    case MKV.Koder.sakstyper.EU_EOS:
      return lagEØSFelter(behandlingsgrunnlag);
    case MKV.Koder.sakstyper.FTRL:
      return lagFTRLFelter(behandlingsgrunnlag);
    case MKV.Koder.sakstyper.TRYGDEAVTALE:
      return lagTrygdeavtaleFelter(behandlingsgrunnlag);
    default:
      throw new Error(`Vi støtter ikke sakstype: ${sakstype}`);
  }
};

export function lagre() {
  return async (dispatch, getState) => {
    dispatch(oppdaterState());
    const behandleAlleSakerToggleEnabled = await erFeatureToggleEnabled("melosys.behandle_alle_saker");

    const behandlingsgrunnlag = Selectors.BehandlingsgrunnlagDataSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    const sakstype = fagsakSelectors.SakstypeKodeSelector(getState());
    const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(getState());

    const data = behandleAlleSakerToggleEnabled
      ? lagBehandlingsgrunnlagData(sakstype, behandlingstema, behandlingsgrunnlag)
      : lagBehandlingsgrunnlagDataEtterBehandlingstema(behandlingstema, behandlingsgrunnlag);

    return dispatch(send(bid, { data }));
  };
}

export function oppdaterPeriode(periode) {
  return (dispatch) => dispatch(Actions.oppdaterPeriode(periode));
}

export function oppdaterSoeknadsland(landkoder, erUkjenteEllerAlleEosLand) {
  return (dispatch) => dispatch(Actions.oppdaterSoeknadsland(landkoder, erUkjenteEllerAlleEosLand));
}

export function oppdaterTrygdedekning(trygdedekning) {
  return (dispatch) => dispatch(Actions.oppdaterTrygdedekning(trygdedekning));
}

export function resetState() {
  return Actions.resetState();
}
