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
import { fagsakSelectors } from "../fagsaker";

export function hent(behandlingID) {
  return async (dispatch, getState) => {
    const doThenDispatchResult = doThenDispatch(() => Api.MottatteOpplysninger.hent(behandlingID), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    });
    const dispatchedMottatteOpplysningerAction = await doThenDispatchResult(dispatch, getState);

    const ekstraOrganisasjoner = [
      ...Selectors.EkstraArbeidsgivereSelector(getState()),
      ...Selectors.SelvstendigArbeidForetakOrgnumreSelector(getState()),
    ];
    const ekstraOrganisasjonerPromises = ekstraOrganisasjoner.map((orgnr) =>
      dispatch(OrganisasjonOperations.hent(orgnr))
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
    const mottatteOpplysningerData = {
      ...formSelectors.SoknadenFormSelector(getState()).values,
      ...formSelectors.VurderStartFormSelector(getState()).values,
    };

    const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(getState());
    if (temaForSedGrunnlag(behandlingstema)) {
      mottatteOpplysningerData.overgangsregelbestemmelser = hentOvergangsregelbestemmelser(
        formSelectors.VurderUtpekingFormSelector(getState()).values
      );
    }

    if (Utils._isEmpty(mottatteOpplysningerData)) return;

    dispatch(Actions.oppdaterState(mottatteOpplysningerData));
  };
}

const lagMottatteOpplysningerFelter = (mottatteOpplysninger) => ({
  juridiskArbeidsgiverNorge: mottatteOpplysninger.juridiskArbeidsgiverNorge,
  personOpplysninger: mottatteOpplysninger.personOpplysninger,
  foretakUtland: mottatteOpplysninger.foretakUtland,
  oppholdUtland: mottatteOpplysninger.oppholdUtland,
  bosted: mottatteOpplysninger.bosted,
  selvstendigArbeid: mottatteOpplysninger.selvstendigArbeid,
  soeknadsland: mottatteOpplysninger.soeknadsland,
  periode: mottatteOpplysninger.periode,
});

const lagArbeidsstederFelter = (mottatteOpplysninger) => ({
  arbeidPaaLand: mottatteOpplysninger.arbeidPaaLand,
  maritimtArbeid: mottatteOpplysninger.maritimtArbeid,
  luftfartBaser: mottatteOpplysninger.luftfartBaser,
});

const lagEØSFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerFelter(mottatteOpplysninger),
  ...lagArbeidsstederFelter(mottatteOpplysninger),
  loennOgGodtgjoerelse: mottatteOpplysninger.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: mottatteOpplysninger.arbeidsgiversBekreftelse,
  arbeidssituasjonOgOevrig: mottatteOpplysninger.arbeidssituasjonOgOevrig,
  utenlandsoppdraget: mottatteOpplysninger.utenlandsoppdraget,
});

const lagFTRLFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerFelter(mottatteOpplysninger),
  ...lagArbeidsstederFelter(mottatteOpplysninger),
  loennOgGodtgjoerelse: mottatteOpplysninger.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: mottatteOpplysninger.arbeidsgiversBekreftelse,
  trygdedekning: mottatteOpplysninger.trygdedekning,
});

const lagTrygdeavtaleFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerFelter(mottatteOpplysninger),
  loennOgGodtgjoerelse: mottatteOpplysninger.loennOgGodtgjoerelse,
  arbeidsgiversBekreftelse: mottatteOpplysninger.arbeidsgiversBekreftelse,
  representantIUtlandet: mottatteOpplysninger.representantIUtlandet,
});

const lagSedGrunnlagFelter = (mottatteOpplysninger) => ({
  ...lagMottatteOpplysningerFelter(mottatteOpplysninger),
  ...lagArbeidsstederFelter(mottatteOpplysninger),
  overgangsregelbestemmelser: mottatteOpplysninger.overgangsregelbestemmelser,
  ytterligereInformasjon: mottatteOpplysninger.ytterligereInformasjon || null,
});

const lagMottatteOpplysningerData = (sakstype, behandlingstema, mottatteOpplysninger) => {
  if (temaForSedGrunnlag(behandlingstema)) {
    return lagSedGrunnlagFelter(mottatteOpplysninger);
  }

  switch (sakstype) {
    case MKV.Koder.sakstyper.EU_EOS:
      return lagEØSFelter(mottatteOpplysninger);
    case MKV.Koder.sakstyper.FTRL:
      return lagFTRLFelter(mottatteOpplysninger);
    case MKV.Koder.sakstyper.TRYGDEAVTALE:
      return lagTrygdeavtaleFelter(mottatteOpplysninger);
    default:
      throw new Error(`Vi støtter ikke sakstype: ${sakstype}`);
  }
};

export function lagre() {
  return (dispatch, getState) => {
    dispatch(oppdaterState());

    const mottatteOpplysninger = Selectors.MottatteOpplysningerDataSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    const sakstype = fagsakSelectors.SakstypeKodeSelector(getState());
    const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(getState());

    const data = lagMottatteOpplysningerData(sakstype, behandlingstema, mottatteOpplysninger);

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
