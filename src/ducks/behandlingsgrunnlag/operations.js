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

/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

// Action Creators
export function hent(behandlingID) {
  return doThenDispatch(() => Api.Behandlingsgrunnlag.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
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

export function oppdaterState() {
  return (dispatch, getState) => {
    const behandlingsgrunnlagData = {
      ...formSelectors.SoknadenFormSelector(getState()).values,
      ...formSelectors.InngangFormSelector(getState()).values,
    };

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
  arbeidNorge: behandlingsgrunnlag.arbeidNorge,
  selvstendigArbeid: behandlingsgrunnlag.selvstendigArbeid,
  maritimtArbeid: behandlingsgrunnlag.maritimtArbeid,
  soeknadsland: behandlingsgrunnlag.soeknadsland,
  periode: behandlingsgrunnlag.periode,
});

const lagSoeknadFelter = behandlingsgrunnlag => ({
  ...lagBehandlingsgrunnlagFelter(behandlingsgrunnlag),
  arbeidsinntekt: behandlingsgrunnlag.arbeidsinntekt,
  arbeidsgiversBekreftelse: behandlingsgrunnlag.arbeidsgiversBekreftelse,
});

const lagBehandlingsgrunnlagData = (behandlingstype, behandlingsgrunnlag) => {
  switch (behandlingstype) {
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD:
    case MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING:
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_FLERE_LAND:
    case MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_ARBEID_NORGE_BOSATT_ANNET_LAND:
      return lagSoeknadFelter(behandlingsgrunnlag);
    case MKV.Koder.behandlinger.behandlingstyper.UTL_MYND_UTPEKT_NORGE:
      return lagBehandlingsgrunnlagFelter(behandlingsgrunnlag);
    default:
      return {};
  }
};

export function lagre() {
  return (dispatch, getState) => {
    dispatch(oppdaterState());

    const behandlingsgrunnlag = Selectors.BehandlingsgrunnlagDataSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    const behandlingstype = behandlingerSelectors.BehandlingstypeKodeSelector(getState());

    const data = lagBehandlingsgrunnlagData(behandlingstype, behandlingsgrunnlag);

    return dispatch(send(bid, { data }));
  };
}

export function oppdaterPeriode(periode) {
  return dispatch => dispatch(Actions.oppdaterPeriode(periode));
}

export function resetState() {
  return Actions.resetState();
}
