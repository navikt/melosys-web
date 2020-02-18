import avklartefaktaReducer, { initialState as avklartefaktaInitialState } from '../../../ducks/avklartefakta';
import anmodningsperiodeReducer, { initialState as anmodningsperioderInitialState } from '../../../ducks/anmodningsperioder';
import anmodningsperiodesvarReducer, { initialState as anmodningsperiodesvarInitialState } from '../../../ducks/anmodningsperiodesvar';
import behandlingerReducer, { initialState as behandlingerInitialState } from '../../../ducks/behandlinger';
import behandlingsresultatReducer, { initialState as behandlingsresultatInitialState } from '../../../ducks/behandlingsresultat';
import fagsakerReducer, { initialState as fagsakerInitialState } from '../../../ducks/fagsaker';
import lovvalgsperioderReducer, { initialState as lovvalgsperioderInitialState } from '../../../ducks/lovvalgsperioder';
import soknadReducer, { initialState as soknadInitialState } from '../../../ducks/behandlingsgrunnlag';

export const initialState = {
  avklartefakta: avklartefaktaInitialState,
  anmodningsperioder: anmodningsperioderInitialState,
  anmodningsperiodesvar: anmodningsperiodesvarInitialState,
  behandlinger: behandlingerInitialState,
  behandlingsresultat: behandlingsresultatInitialState,
  fagsaker: fagsakerInitialState,
  lovvalgsperioder: lovvalgsperioderInitialState,
  soknad: soknadInitialState,
};

export const reducer = ({
  avklartefakta,
  anmodningsperioder,
  anmodningsperiodesvar,
  behandlinger,
  behandlingsresultat,
  fagsaker,
  lovvalgsperioder,
  soknad,
}, action) => ({
  avklartefakta: avklartefaktaReducer(avklartefakta, action),
  anmodningsperioder: anmodningsperiodeReducer(anmodningsperioder, action),
  anmodningsperiodesvar: anmodningsperiodesvarReducer(anmodningsperiodesvar, action),
  behandlinger: behandlingerReducer(behandlinger, action),
  behandlingsresultat: behandlingsresultatReducer(behandlingsresultat, action),
  fagsaker: fagsakerReducer(fagsaker, action),
  lovvalgsperioder: lovvalgsperioderReducer(lovvalgsperioder, action),
  soknad: soknadReducer(soknad, action),
});
