import * as Validering from "../../felleskomponenter/skjema/validering";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import * as Actions from "./actions";
import * as Types from "./types";
import * as Selectors from "./selectors";

import MKV from "../../melosyskodeverk";

import { doThenDispatch } from "../../services/utils";

import { formSelectors } from "../form";
import { behandlingerSelectors } from "../behandlinger";
import { OrganisasjonOperations } from "../organisasjoner";
import { navigeringOperations } from "../navigering";

export function hent(behandlingID) {
  return async (dispatch, getState) => {
    const doThenDispatchResult = doThenDispatch(() => Api.MottatteOpplysninger.hent(behandlingID), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    });
    const dispatchedMottatteOpplysningerAction = await doThenDispatchResult(dispatch, getState);

    if (dispatchedMottatteOpplysningerAction.type === Types.FEILET) {
      await dispatch(navigeringOperations.tilIngenFlyt());
      return dispatchedMottatteOpplysningerAction;
    }

    const ekstraOrganisasjoner = [
      ...Selectors.EkstraArbeidsgivereSelector(getState()),
      ...Selectors.SelvstendigArbeidForetakOrgnumreSelector(getState()),
    ];
    const ekstraOrganisasjonerPromises = ekstraOrganisasjoner.map((orgnr) =>
      dispatch(OrganisasjonOperations.hent(orgnr)),
    );
    await Promise.all(ekstraOrganisasjonerPromises);

    return dispatchedMottatteOpplysningerAction;
  };
}

export function send(bid, mottatteOpplysninger) {
  return doThenDispatch(
    () => Api.MottatteOpplysninger.send(bid, mottatteOpplysninger),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch, data) => Validering.Felles.forsokValidering(dispatch, data),
    },
  );
}

const hentOvergangsregelbestemmelser = (values) => (values ? values.overgangsregelbestemmelser : []);

export function oppdaterState() {
  return (dispatch, getState) => {
    const mottatteOpplysningerData = {
      ...formSelectors.SoknadFormSelector(getState()).values,
    };

    const mottatteOpplysningerType = Selectors.MottatteOpplysningerTypeSelector(getState());

    if (mottatteOpplysningerType === MKV.Koder.mottatteopplysningertyper.SED) {
      mottatteOpplysningerData.overgangsregelbestemmelser = hentOvergangsregelbestemmelser(
        formSelectors.VurderUtpekingFormSelector(getState()).values,
      );
    }

    if (Utils._isEmpty(mottatteOpplysningerData)) return;

    dispatch(Actions.oppdaterState(mottatteOpplysningerData));
  };
}

const lagMottatteOpplysningerDataFellesFelter = (mottatteOpplysninger) => ({
  juridiskArbeidsgiverNorge: mottatteOpplysninger.juridiskArbeidsgiverNorge,
  personOpplysninger: mottatteOpplysninger.personOpplysninger,
  foretakUtland: mottatteOpplysninger.foretakUtland,
  oppholdUtland: mottatteOpplysninger.oppholdUtland,
  bosted: mottatteOpplysninger.bosted,
  selvstendigArbeid: mottatteOpplysninger.selvstendigArbeid,
  soeknadsland: mottatteOpplysninger.soeknadsland,
  periode: mottatteOpplysninger.periode,
  arbeidPaaLand: mottatteOpplysninger.arbeidPaaLand,
  maritimtArbeid: mottatteOpplysninger.maritimtArbeid,
  luftfartBaser: mottatteOpplysninger.luftfartBaser,
});

const lagSøknadEØSFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerDataFellesFelter(mottatteOpplysninger),
  loennOgGodtgjoerelse: mottatteOpplysninger.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: mottatteOpplysninger.arbeidsgiversBekreftelse,
  arbeidssituasjonOgOevrig: mottatteOpplysninger.arbeidssituasjonOgOevrig,
  utenlandsoppdraget: mottatteOpplysninger.utenlandsoppdraget,
});

const lagSøknadYrkesaktiveNorgeEllerUtenforEØSFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerDataFellesFelter(mottatteOpplysninger),
  trygdedekning: mottatteOpplysninger.trygdedekning,
  representantIUtlandet: mottatteOpplysninger.representantIUtlandet,
});

const lagSøknadIkkeYrkesaktivFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerDataFellesFelter(mottatteOpplysninger),
  ikkeYrkesaktivSituasjontype: mottatteOpplysninger.ikkeYrkesaktivSituasjontype,
});

const lagSedGrunnlagFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerDataFellesFelter(mottatteOpplysninger),
  overgangsregelbestemmelser: mottatteOpplysninger.overgangsregelbestemmelser,
  ytterligereInformasjon: mottatteOpplysninger.ytterligereInformasjon || null,
});

const lagAnmodningEllerAttestFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerDataFellesFelter(mottatteOpplysninger),
  avsenderland: mottatteOpplysninger.avsenderland,
  lovvalgsland: mottatteOpplysninger.lovvalgsland,
});

const lagMottatteOpplysningerData = (mottatteOpplysninger, mottatteOpplysningerType) => {
  switch (mottatteOpplysningerType) {
    case MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS:
    case MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_YRKESAKTIVE_EØS:
      return lagSøknadEØSFelter(mottatteOpplysninger);
    case MKV.Koder.mottatteopplysningertyper.SØKNAD_YRKESAKTIVE_NORGE_ELLER_UTENFOR_EØS:
      return lagSøknadYrkesaktiveNorgeEllerUtenforEØSFelter(mottatteOpplysninger);
    case MKV.Koder.mottatteopplysningertyper.SØKNAD_IKKE_YRKESAKTIV:
      return lagSøknadIkkeYrkesaktivFelter(mottatteOpplysninger);
    case MKV.Koder.mottatteopplysningertyper.ANMODNING_ELLER_ATTEST:
      return lagAnmodningEllerAttestFelter(mottatteOpplysninger);
    case MKV.Koder.mottatteopplysningertyper.SED:
      return lagSedGrunnlagFelter(mottatteOpplysninger);
    default:
      throw new Error(`Vi støtter ikke mottatteopplysningertype: ${mottatteOpplysningerType}`);
  }
};

// Verner mot hele klassen "server returnerer nøkkel klienten ikke speiler": da veksler initialValues og autolagringen kan
// ellers gå i evig løkke med bit-identisk payload. Nullstilles i resetState (ny behandling).
let sistSendtPayload = null;

export function lagre() {
  return async (dispatch, getState) => {
    dispatch(oppdaterState());

    const mottatteOpplysninger = Selectors.MottatteOpplysningerDataSelector(getState());
    const mottatteOpplysningerType = Selectors.MottatteOpplysningerTypeSelector(getState());
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());

    const data = lagMottatteOpplysningerData(mottatteOpplysninger, mottatteOpplysningerType);

    const payload = JSON.stringify([behandlingID, data]);
    if (payload === sistSendtPayload) return undefined;
    sistSendtPayload = payload;

    const resultat = await dispatch(send(behandlingID, { data }));
    if (resultat && resultat.type === Types.FEILET) sistSendtPayload = null;

    return resultat;
  };
}

export function oppdaterPeriode(periode) {
  return (dispatch) => dispatch(Actions.oppdaterPeriode(periode));
}

export function oppdaterSoeknadsland(landkoder, flereLandUkjentHvilke) {
  return (dispatch) => dispatch(Actions.oppdaterSoeknadsland(landkoder, flereLandUkjentHvilke));
}

export function oppdaterAvsenderland(avsenderland) {
  return (dispatch) => dispatch(Actions.oppdaterAvsenderland(avsenderland));
}

export function oppdaterLovvalgsland(lovvalgsland) {
  return (dispatch) => dispatch(Actions.oppdaterLovvalgsland(lovvalgsland));
}

export function oppdaterTrygdedekning(trygdedekning) {
  return (dispatch) => dispatch(Actions.oppdaterTrygdedekning(trygdedekning));
}

export function oppdaterIkkeYrkesaktivSituasjontype(ikkeYrkesaktivSituasjontype) {
  return (dispatch) => dispatch(Actions.oppdaterIkkeYrkesaktivSituasjontype(ikkeYrkesaktivSituasjontype));
}

export function resetState() {
  sistSendtPayload = null;
  return Actions.resetState();
}
