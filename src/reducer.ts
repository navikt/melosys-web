import { reducer as formReducer } from "redux-form";

import anmodningOmUnntakReducer from "./ducks/anmodningunntak";
import anmodningsperioderReducer from "./ducks/anmodningsperioder";
import anmodningsperiodesvarReducer from "./ducks/anmodningsperiodesvar";
import avklartefaktaReducer from "./ducks/avklartefakta";
import behandlingerReducer from "./ducks/behandlinger";
import mottatteOpplysningerReducer from "./ducks/mottatteOpplysninger";
import behandlingsperioderReducer from "./ducks/behandlingsperioder";
import behandlingsresultatReducer from "./ducks/behandlingsresultat";
import behandlingsstatusReducer from "./ducks/behandlingsstatus";
import dokumenterReducer from "./ducks/dokumenter";
import fagsakerReducer from "./ducks/fagsaker";
import feiletResponseReducer from "./ducks/feiletRespons";
import folketrygdenkodeverkReducer from "./ducks/folketrygdenkodeverk";
import journalforingReducer from "./ducks/journalforing";
import kontrollReducer from "./ducks/kontroll";
import landkoderReducer from "./ducks/landkoder";
import lovvalgsperioderReducer from "./ducks/lovvalgsperioder";
import medlemskapsperioderReducer from "./ducks/medlemskapsperioder";
import modalerReducer from "./ducks/modaler";
import oppgaverReducer from "./ducks/oppgaver";
import oppsummertfaktaReducer from "./ducks/oppsummertfakta";
import organisasjonerReducer from "./ducks/organisasjoner";
import saksopplysningerReducer from "./ducks/saksopplysninger";
import sokReducer from "./ducks/sok";
import menypanelReducer from "./ducks/menypanel";
import utpekReducer from "./ducks/utpek";
import utpekingsperioderReducer from "./ducks/utpekingsperioder";
import videresendingReducer from "./ducks/videresending";
import vilkarReducer from "./ducks/vilkar";
import vedtakReducer from "./ducks/vedtak";

import customFormReducer from "./ducks/form";
import fakturaserierReducers from "./ducks/fakturaserier";
import featureToggleReducers from "./ducks/featuretoggle";
import aarsavregningReducers from "./ducks/aarsavregning";
import helseutgiftdekkesperiodeReducers from "./ducks/helseutgiftdekkesperiode";
import pensjonsopptjeningReducer from "./ducks/pensjonsopptjening";

const rootReducer = {
  form: formReducer.plugin({ forretningsValidering: customFormReducer }),
  anmodningomunntak: anmodningOmUnntakReducer,
  anmodningsperioder: anmodningsperioderReducer,
  anmodningsperiodesvar: anmodningsperiodesvarReducer,
  featureToggle: featureToggleReducers,
  avklartefakta: avklartefaktaReducer,
  behandlinger: behandlingerReducer,
  mottatteOpplysninger: mottatteOpplysningerReducer,
  behandlingsperioder: behandlingsperioderReducer,
  behandlingsresultat: behandlingsresultatReducer,
  behandlingsstatus: behandlingsstatusReducer,
  dokumenter: dokumenterReducer,
  fagsaker: fagsakerReducer,
  feiletRespons: feiletResponseReducer,
  folketrygdenkodeverk: folketrygdenkodeverkReducer,
  fakturaserier: fakturaserierReducers,
  journalforing: journalforingReducer,
  kontroll: kontrollReducer,
  landkoder: landkoderReducer,
  lovvalgsperioder: lovvalgsperioderReducer,
  medlemskapsperioder: medlemskapsperioderReducer,
  modaler: modalerReducer,
  oppgaver: oppgaverReducer,
  oppsummertfakta: oppsummertfaktaReducer,
  organisasjoner: organisasjonerReducer,
  saksopplysninger: saksopplysningerReducer,
  sok: sokReducer,
  menypanel: menypanelReducer,
  utpek: utpekReducer,
  utpekingsperioder: utpekingsperioderReducer,
  vedtak: vedtakReducer,
  videresending: videresendingReducer,
  vilkar: vilkarReducer,
  aarsavregning: aarsavregningReducers,
  helseutgiftdekkesperiode: helseutgiftdekkesperiodeReducers,
  pensjonsopptjening: pensjonsopptjeningReducer,
};

export default rootReducer;
