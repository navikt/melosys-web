import { RootState } from 'AppTypes';

import { STATUS } from '../../services/utils';

/**
 * Genererer default state for redux til testing, samt tillater å sette individuelle states.
 */
function lagState({
  form = {
    testForm: {
      registeredFields: [],
    },
  },
  router = {
    location: {
      pathname: '',
      state: '',
      search: '',
      hash: '',
    },
    action: 'PUSH',
  },
  anmodningomunntak = { status: STATUS.OK, data: {} },
  anmodningsperioder = { status: STATUS.OK, data: [] },
  anmodningsperiodesvar = { status: STATUS.OK, data: {} },
  avklartefakta = { status: STATUS.OK, data: [] },
  behandlinger = { status: STATUS.OK, data: {} },
  behandlingsgrunnlag = { status: STATUS.OK, data: {} },
  behandlingsperioder = { status: STATUS.OK, data: {} },
  behandlingsresultat = { status: STATUS.OK, data: {} },
  behandlingstema = { status: STATUS.OK, data: {} },
  dokumenter = { status: STATUS.OK, data: {} },
  fagsaker = { status: STATUS.OK, data: {} },
  feiletrespons = { status: STATUS.OK, data: {} },
  folketrygdenkodeverk = { status: STATUS.OK, data: {}},
  journalforing = { status: STATUS.OK, data: {} },
  lovvalgsperioder = { status: STATUS.OK, data: [] },
  modaler = { status: STATUS.OK, data: {} },
  oppgaver = { status: STATUS.OK, data: {} },
  organisasjoner = { status: STATUS.OK, data: [] },
  personer = { status: STATUS.OK, data: [] },
  saksbehandler = { status: STATUS.OK, data: {} },
  saksopplysninger = { status: STATUS.OK, data: {} },
  sok = { status: STATUS.OK, data: [] },
  soknadspanel = { status: STATUS.OK, data: { synlig: false } },
  utpek = { status: STATUS.OK, data: {} },
  utpekingsperioder = { status: STATUS.OK, data: [] },
  vedtak = { status: STATUS.OK, data: {} },
  videresending = { status: STATUS.OK, data: {} },
  vilkar = { status: STATUS.OK, data: [] },
}: Partial<RootState>): RootState {
  return ({
    form,
    router,
    anmodningomunntak,
    anmodningsperioder,
    anmodningsperiodesvar,
    avklartefakta,
    behandlinger,
    behandlingsgrunnlag,
    behandlingsperioder,
    behandlingsresultat,
    behandlingstema,
    dokumenter,
    fagsaker,
    feiletrespons,
    folketrygdenkodeverk,
    journalforing,
    lovvalgsperioder,
    modaler,
    oppgaver,
    organisasjoner,
    personer,
    saksbehandler,
    saksopplysninger,
    sok,
    soknadspanel,
    utpek,
    utpekingsperioder,
    vedtak,
    videresending,
    vilkar,
  });
}

export default lagState;
