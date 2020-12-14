import * as Validering from '../../felleskomponenter/skjema/validering';
import * as Api from '../../services/api';
import * as Utils from '../../utils';
import * as Actions from './actions';
import * as Types from './types';
import * as Selectors from './selectors';

import MKV from '../../melosyskodeverk';

import { doThenDispatch } from '../../services/utils';
import { formSelectors } from '../form';
import { behandlingerSelectors } from '../behandlinger';
import { OrganisasjonOperations } from '../organisasjoner';

export function hent(behandlingID) {
  return (dispatch, getState) => {
    const thunk = doThenDispatch(
      () => Api.Behandlingsgrunnlag.hent(behandlingID), {
        OK: Types.OK,
        FEILET: Types.FEILET,
        PENDING: Types.PENDING,
      },
      {
        success: () => [
          ...Selectors.EkstraArbeidsgivereSelector(getState()),
          ...Selectors.SelvstendigArbeidForetakOrgnumreSelector(getState()),
        ].forEach(orgnr => dispatch(OrganisasjonOperations.hent(orgnr))),
      }
    );

    return thunk(dispatch, getState);
  };
}

export function send(bid, behandlingsgrunnlag) {
  return doThenDispatch(
    () => Api.Behandlingsgrunnlag.send(bid, behandlingsgrunnlag), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch, data) => Validering.Felles.forsokValidering(dispatch, data),
    }
  );
}

const hentOvergangsregelbestemmelser = values => (values ? values.overgangsregelbestemmelser : []);

const temaForSedGrunnlag = behandlingstema => [
  MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
  MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
].includes(behandlingstema);

export function oppdaterState() {
  return (dispatch, getState) => {
    const behandlingsgrunnlagData = {
      ...formSelectors.SoknadenFormSelector(getState()).values,
      ...formSelectors.InngangFormSelector(getState()).values,
      ...formSelectors.VurderStartFormSelector(getState()).values,
    };

    const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(getState());
    if (temaForSedGrunnlag(behandlingstema)) {
      behandlingsgrunnlagData.overgangsregelbestemmelser =
        hentOvergangsregelbestemmelser(formSelectors.VurderUtpekingFormSelector(getState()).values);
    }

    if (Utils._isEmpty(behandlingsgrunnlagData)) return;

    dispatch(Actions.oppdaterState(behandlingsgrunnlagData));
  };
}

const lagBehandlingsgrunnlagFelter = behandlingsgrunnlag => ({
  juridiskArbeidsgiverNorge: behandlingsgrunnlag.juridiskArbeidsgiverNorge,
  personOpplysninger: behandlingsgrunnlag.personOpplysninger,
  arbeidUtland: behandlingsgrunnlag.arbeidUtland,
  foretakUtland: behandlingsgrunnlag.foretakUtland,
  oppholdUtland: behandlingsgrunnlag.oppholdUtland,
  bosted: behandlingsgrunnlag.bosted,
  selvstendigArbeid: behandlingsgrunnlag.selvstendigArbeid,
  maritimtArbeid: behandlingsgrunnlag.maritimtArbeid,
  soeknadsland: behandlingsgrunnlag.soeknadsland,
  periode: behandlingsgrunnlag.periode,
  luftfartBaser: behandlingsgrunnlag.luftfartBaser,
});

const lagSoeknadFelter = behandlingsgrunnlag => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  arbeidsinntekt: behandlingsgrunnlag.arbeidsinntekt,
  arbeidsgiversBekreftelse: behandlingsgrunnlag.arbeidsgiversBekreftelse,
});

const lagFTRLFelter = behandlingsgrunnlag => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  arbeidsinntekt: behandlingsgrunnlag.arbeidsinntekt,
  arbeidsgiversBekreftelse: behandlingsgrunnlag.arbeidsgiversBekreftelse,
  trygdedekning: behandlingsgrunnlag.trygdedekning,
});

const lagSedGrunnlagFelter = behandlingsgrunnlag => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  overgangsregelbestemmelser: behandlingsgrunnlag.overgangsregelbestemmelser,
  ytterligereInformasjon: behandlingsgrunnlag.ytterligereInformasjon,
});

const lagBehandlingsgrunnlagData = (behandlingstema, behandlingsgrunnlag) => {
  switch (behandlingstema) {
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER:
    case MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG:
    case MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND:
      return lagSoeknadFelter(behandlingsgrunnlag);
    case MKV.Koder.behandlinger.behandlingstema.ARBEID_I_UTLANDET:
      return lagFTRLFelter(behandlingsgrunnlag);
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return lagSedGrunnlagFelter(behandlingsgrunnlag);
    default:
      return {};
  }
};

export function lagre() {
  return (dispatch, getState) => {
    dispatch(oppdaterState());

    const behandlingsgrunnlag = Selectors.BehandlingsgrunnlagDataSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(getState());

    const data = lagBehandlingsgrunnlagData(behandlingstema, behandlingsgrunnlag);

    return dispatch(send(bid, { data }));
  };
}

export function oppdaterPeriode(periode) {
  return dispatch => dispatch(Actions.oppdaterPeriode(periode));
}

export function oppdaterSoeknadsland(soeknadsland) {
  return dispatch => dispatch(Actions.oppdaterSoeknadsland(soeknadsland));
}

export function oppdaterTrygdedekning(trygdedekning) {
  return dispatch => dispatch(Actions.oppdaterTrygdedekning(trygdedekning));
}

export function resetState() {
  return Actions.resetState();
}
