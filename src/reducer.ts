import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { connectRouter } from "connected-react-router";
import { History } from "history";

import anmodningOmUnntakReducer from "./ducks/anmodningunntak";
import anmodningsperioderReducer from "./ducks/anmodningsperioder";
import anmodningsperiodesvarReducer from "./ducks/anmodningsperiodesvar";
import avklartefaktaReducer from "./ducks/avklartefakta";
import behandlingerReducer from "./ducks/behandlinger";
import behandlingsgrunnlagReducer from "./ducks/behandlingsgrunnlag";
import behandlingsperioderReducer from "./ducks/behandlingsperioder";
import behandlingsresultatReducer from "./ducks/behandlingsresultat";
import behandlingstemaReducer from "./ducks/behandlingstema";
import behandlingsstatusReducer from "./ducks/behandlingsstatus";
import dokumenterReducer from "./ducks/dokumenter";
import fagsakerReducer from "./ducks/fagsaker";
import feiletResponseReducer from "./ducks/feiletrespons";
import folketrygdenkodeverkReducer from "./ducks/folketrygdenkodeverk";
import journalforingReducer from "./ducks/journalforing";
import landkoder from "./ducks/landkoder";
import lovvalgsperioderReducer from "./ducks/lovvalgsperioder";
import medlemskapsperioderReducer from "./ducks/medlemskapsperioder";
import modalerReducer from "./ducks/modaler";
import oppgaverReducer from "./ducks/oppgaver";
import oppsummertfaktaReducer from "./ducks/oppsummertfakta";
import organisasjonerReducer from "./ducks/organisasjoner";
import personerReducer from "./ducks/personer";
import saksbehandlerReducer from "./ducks/saksbehandler";
import saksopplysningerReducer from "./ducks/saksopplysninger";
import sokReducer from "./ducks/sok";
import menypanelReducer from "./ducks/menypanel";
import utpekReducer from "./ducks/utpek";
import utpekingsperioderReducer from "./ducks/utpekingsperioder";
import videresendingReducer from "./ducks/videresending";
import vilkarReducer from "./ducks/vilkar";
import vedtakReducer from "./ducks/vedtak";

import customFormReducer from "./ducks/form";

const createRootReducer = (history: History) =>
  combineReducers({
    form: formReducer.plugin({ forretningsValidering: customFormReducer }),
    router: connectRouter(history),
    anmodningomunntak: anmodningOmUnntakReducer,
    anmodningsperioder: anmodningsperioderReducer,
    anmodningsperiodesvar: anmodningsperiodesvarReducer,
    avklartefakta: avklartefaktaReducer,
    behandlinger: behandlingerReducer,
    behandlingsgrunnlag: behandlingsgrunnlagReducer,
    behandlingsperioder: behandlingsperioderReducer,
    behandlingsresultat: behandlingsresultatReducer,
    behandlingstema: behandlingstemaReducer,
    behandlingsstatus: behandlingsstatusReducer,
    dokumenter: dokumenterReducer,
    fagsaker: fagsakerReducer,
    feiletrespons: feiletResponseReducer,
    folketrygdenkodeverk: folketrygdenkodeverkReducer,
    journalforing: journalforingReducer,
    landkoder,
    lovvalgsperioder: lovvalgsperioderReducer,
    medlemskapsperioder: medlemskapsperioderReducer,
    modaler: modalerReducer,
    oppgaver: oppgaverReducer,
    oppsummertfakta: oppsummertfaktaReducer,
    organisasjoner: organisasjonerReducer,
    personer: personerReducer,
    saksbehandler: saksbehandlerReducer,
    saksopplysninger: saksopplysningerReducer,
    sok: sokReducer,
    menypanel: menypanelReducer,
    utpek: utpekReducer,
    utpekingsperioder: utpekingsperioderReducer,
    vedtak: vedtakReducer,
    videresending: videresendingReducer,
    vilkar: vilkarReducer,
  });

export default createRootReducer;
