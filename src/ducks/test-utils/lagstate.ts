import { RootState } from "AppTypes";

import { STATUS } from "../../services";

/**
 * Genererer default state for redux til testing, samt tillater å sette individuelle states.
 */
/**
 * @deprecated Bruk renderWithProviders for testing på redux komponenter
 */
function lagState({
  form = {
    testForm: {
      registeredFields: [],
    },
  },
  router = {
    location: {
      pathname: "",
      state: "",
      search: "",
      hash: "",
      query: {},
    },
    action: "PUSH",
  },
  anmodningomunntak = { status: STATUS.OK, data: {} },
  anmodningsperioder = { status: STATUS.OK, data: [] },
  anmodningsperiodesvar = { status: STATUS.OK, data: {} },
  avklartefakta = { status: STATUS.OK, data: [] },
  behandlinger = { status: STATUS.OK, data: {} },
  mottatteOpplysninger = { status: STATUS.OK, data: {} },
  behandlingsperioder = { status: STATUS.OK, data: {} },
  behandlingsresultat = { status: STATUS.OK, data: {} },
  behandlingsstatus = { status: STATUS.OK, data: {} },
  dokumenter = { status: STATUS.OK, data: {} },
  featureToggle = { status: STATUS.OK, data: {} },
  fagsaker = { status: STATUS.OK, data: {} },
  feiletRespons = { status: STATUS.OK, data: {} },
  folketrygdenkodeverk = { status: STATUS.OK, data: {} },
  fakturainformasjon = {
    status: STATUS.OK,
    data: {
      fakturaserie: {},
      fakturainfo: {},
    },
  },
  journalforing = { status: STATUS.OK, data: {} },
  kontroll = { status: STATUS.OK, data: {} },
  landkoder = { status: STATUS.OK, data: [] },
  lovvalgsperioder = { status: STATUS.OK, data: [] },
  medlemskapsperioder = { status: STATUS.OK, data: {} },
  modaler = { status: STATUS.OK, data: {} },
  oppgaver = { status: STATUS.OK, data: {} },
  oppsummertfakta = { status: STATUS.OK, data: {} },
  organisasjoner = { status: STATUS.OK, data: [] },
  saksopplysninger = { status: STATUS.OK, data: {} },
  sok = { status: STATUS.OK, data: [] },
  menypanel = { status: STATUS.OK, data: { synlig: false } },
  utpek = { status: STATUS.OK, data: {} },
  utpekingsperioder = { status: STATUS.OK, data: [] },
  vedtak = { status: STATUS.OK, data: {} },
  videresending = { status: STATUS.OK, data: {} },
  vilkar = { status: STATUS.OK, data: [] },
}: Partial<RootState>): RootState {
  return {
    form,
    router,
    anmodningomunntak,
    anmodningsperioder,
    anmodningsperiodesvar,
    avklartefakta,
    behandlinger,
    mottatteOpplysninger,
    behandlingsperioder,
    featureToggle,
    behandlingsresultat,
    behandlingsstatus,
    dokumenter,
    fagsaker,
    feiletRespons,
    folketrygdenkodeverk,
    fakturainformasjon,
    kontroll,
    journalforing,
    landkoder,
    lovvalgsperioder,
    medlemskapsperioder,
    modaler,
    oppgaver,
    oppsummertfakta,
    organisasjoner,
    saksopplysninger,
    sok,
    menypanel,
    utpek,
    utpekingsperioder,
    vedtak,
    videresending,
    vilkar,
  };
}

export default lagState;
